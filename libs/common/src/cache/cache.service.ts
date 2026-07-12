import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class CacheService implements OnModuleInit {
  private readonly logger = new Logger(CacheService.name);
  private redis: Redis | null = null;
  private isConnected = false;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    try {
      const redisUrl = this.config.get<string>('REDIS');
      if (!redisUrl) {
        this.logger.warn('REDIS env not found, cache will be disabled');
        return;
      }

      const url = new URL(redisUrl);
      this.redis = new Redis({
        host: url.hostname,
        port: parseInt(url.port, 10) || 6379,
        password: url.password || undefined,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });

      this.redis.on('connect', () => {
        this.isConnected = true;
        this.logger.log('Redis connected');
      });

      this.redis.on('error', (err) => {
        this.isConnected = false;
        this.logger.error(`Redis error: ${err.message}`);
      });

      this.redis.on('close', () => {
        this.isConnected = false;
        this.logger.warn('Redis connection closed');
      });

      await this.redis.ping();
    } catch (err: unknown) {
      this.logger.warn(`Failed to connect to Redis: ${(err as Error).message}`);
      this.redis = null;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis || !this.isConnected) return null;
    try {
      const data = await this.redis.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (err: unknown) {
      this.logger.warn(
        `Cache get error for key "${key}": ${(err as Error).message}`,
      );
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<boolean> {
    if (!this.redis || !this.isConnected) return false;
    try {
      const data = JSON.stringify(value);
      await this.redis.setex(key, ttlSeconds, data);
      return true;
    } catch (err: unknown) {
      this.logger.warn(
        `Cache set error for key "${key}": ${(err as Error).message}`,
      );
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.redis || !this.isConnected) return false;
    try {
      const result = await this.redis.del(key);
      return result > 0;
    } catch (err: unknown) {
      this.logger.warn(
        `Cache del error for key "${key}": ${(err as Error).message}`,
      );
      return false;
    }
  }

  async delPattern(pattern: string): Promise<number> {
    if (!this.redis || !this.isConnected) return 0;
    try {
      let deleted = 0;
      let cursor = '0';
      do {
        const [nextCursor, keys] = await this.redis.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          100,
        );
        cursor = nextCursor;
        if (keys.length > 0) {
          await this.redis.del(...keys);
          deleted += keys.length;
        }
      } while (cursor !== '0');
      return deleted;
    } catch (err: unknown) {
      this.logger.warn(`Cache delPattern error: ${(err as Error).message}`);
      return 0;
    }
  }

  isAvailable(): boolean {
    return this.isConnected && this.redis !== null;
  }

  async ping(): Promise<boolean> {
    if (!this.redis || !this.isConnected) return false;
    try {
      await this.redis.ping();
      return true;
    } catch {
      return false;
    }
  }

  async getTtl(key: string): Promise<number> {
    if (!this.redis || !this.isConnected) return -2;
    try {
      return await this.redis.ttl(key);
    } catch (err: unknown) {
      this.logger.warn(
        `Cache ttl error for key "${key}": ${(err as Error).message}`,
      );
      return -2;
    }
  }
}
