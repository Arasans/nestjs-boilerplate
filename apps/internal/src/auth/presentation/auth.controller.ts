import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { User } from '@app/common';
import { JwtGuard } from '../infrastructure/guards/jwt.guard';
import { RtGuard } from '../infrastructure/guards/rt.guard';
import { LoginDto } from '../application/dto/login.dto';
import { ResetPassDto } from '../application/dto/reset-pass.dto';
import {
  LoginCommand,
  RefreshCommand,
  ResetPassCommand,
} from '../application/commands';
import { MeQuery } from '../application/queries';
import { ICurrentUser, ICurrentUserRt } from '../domain/auth.types';

@Controller('auth')
@ApiTags('Auth')
@ApiBearerAuth()
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('login')
  login(@Body() request: LoginDto) {
    return this.commandBus.execute(new LoginCommand(request));
  }

  @UseGuards(RtGuard)
  @Post('refresh')
  refresh(@User() user: ICurrentUserRt) {
    return this.commandBus.execute(new RefreshCommand(user));
  }

  @Get('me')
  @UseGuards(JwtGuard)
  me(@User() user: ICurrentUser) {
    return this.queryBus.execute(new MeQuery(user));
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(JwtGuard, ThrottlerGuard)
  @Post('reset-password')
  resetPassword(@Body() request: ResetPassDto, @User() user: ICurrentUser) {
    return this.commandBus.execute(new ResetPassCommand(user, request));
  }
}
