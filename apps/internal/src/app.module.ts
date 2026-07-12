import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { CacheModule } from '@app/common';
import { ValidatorProviders } from '@app/validator';
import { AuthModule } from './auth/auth.module';
import { RoleModule } from './role/role.module';
import { UserModule } from './user/user.module';
import { ExampleModule } from './example/example.module';
import { AppController } from './app.controller';
import { RedisHealthIndicator } from './health/redis.health-indicator';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule.forRoot(),
    ThrottlerModule.forRoot({ throttlers: [{ ttl: 0, limit: 0 }] }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
      }),
    }),
    CacheModule,
    TerminusModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisUrl = new URL(config.get<string>('REDIS') || '');
        return {
          connection: {
            host: redisUrl.hostname,
            port: parseInt(redisUrl.port, 10),
            password: redisUrl.password,
          },
        };
      },
    }),
    RoleModule,
    UserModule,
    AuthModule,
    ExampleModule,
  ],
  controllers: [AppController],
  providers: [...ValidatorProviders, RedisHealthIndicator],
})
export class AppModule {}
