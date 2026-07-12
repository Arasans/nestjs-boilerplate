import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { RtStrategy } from './infrastructure/strategies/rt.strategy';
import { AuthService } from './domain/auth.service';
import { UserCacheService } from './domain/user-cache.service';
import { AuthCommandsHandlers } from './application/commands';
import { AuthQueriesHandlers } from './application/queries';
import { AuthController } from './presentation/auth.controller';

@Module({
  imports: [JwtModule.register({}), UserModule],
  providers: [
    AuthService,
    UserCacheService,
    JwtStrategy,
    RtStrategy,
    ...AuthCommandsHandlers,
    ...AuthQueriesHandlers,
  ],
  controllers: [AuthController],
  exports: [UserCacheService],
})
export class AuthModule {}
