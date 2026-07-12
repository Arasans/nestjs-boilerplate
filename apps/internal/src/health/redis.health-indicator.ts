import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorService,
  type HealthIndicatorResult,
} from '@nestjs/terminus';
import { CacheService } from '@app/common';

@Injectable()
export class RedisHealthIndicator {
  constructor(
    private readonly indicator: HealthIndicatorService,
    private readonly cache: CacheService,
  ) {}

  async check(key: string): Promise<HealthIndicatorResult> {
    const session = this.indicator.check(key);
    const isHealthy = await this.cache.ping();
    return isHealthy ? session.up() : session.down();
  }
}
