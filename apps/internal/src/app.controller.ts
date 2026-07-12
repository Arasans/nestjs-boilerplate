import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { SkipAuth } from './auth/infrastructure/decorators/skip-auth.decorator';
import { RedisHealthIndicator } from './health/redis.health-indicator';

@Controller()
@ApiTags('Health')
export class AppController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly mongoose: MongooseHealthIndicator,
    private readonly redis: RedisHealthIndicator,
  ) {}

  @Get()
  @SkipAuth()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.mongoose.pingCheck('mongodb'),
      () => this.redis.check('redis'),
    ]);
  }
}
