import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '@app/common';
import { ICurrentUser } from './auth.types';

const CACHE_KEY_PREFIX = 'cache:internal:user';
const CACHE_TTL_SECONDS = 24 * 60 * 60;

@Injectable()
export class UserCacheService {
  private readonly logger = new Logger(UserCacheService.name);

  constructor(private readonly cacheService: CacheService) {}

  private getKey(userId: string): string {
    return `${CACHE_KEY_PREFIX}:${userId}`;
  }

  async get(userId: string): Promise<ICurrentUser | null> {
    try {
      return await this.cacheService.get<ICurrentUser>(this.getKey(userId));
    } catch (err: unknown) {
      this.logger.warn(`Failed to get user cache: ${(err as Error).message}`);
      return null;
    }
  }

  async set(user: ICurrentUser): Promise<boolean> {
    try {
      return await this.cacheService.set(
        this.getKey(user.id),
        user,
        CACHE_TTL_SECONDS,
      );
    } catch (err: unknown) {
      this.logger.warn(`Failed to set user cache: ${(err as Error).message}`);
      return false;
    }
  }

  async del(userId: string): Promise<boolean> {
    try {
      return await this.cacheService.del(this.getKey(userId));
    } catch (err: unknown) {
      this.logger.warn(
        `Failed to delete user cache: ${(err as Error).message}`,
      );
      return false;
    }
  }

  isAvailable(): boolean {
    return this.cacheService.isAvailable();
  }
}
