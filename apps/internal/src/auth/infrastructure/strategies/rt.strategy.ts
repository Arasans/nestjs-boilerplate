import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';
import { ICurrentUserRt, IUserPayload } from '../../domain/auth.types';
import { AuthType } from '@app/common';
import { AuthService } from '../../domain/auth.service';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'rt-jwt') {
  constructor(
    private readonly authService: AuthService,
    config: ConfigService,
  ) {
    super({
      passReqToCallback: true,
      ignoreExpiration: false,
      secretOrKey: config.get<string>('RT_SECRET') || '',
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    } satisfies StrategyOptionsWithRequest);
  }

  async validate(req: any, payload: IUserPayload): Promise<ICurrentUserRt> {
    if (!payload?.sub || !Types.ObjectId.isValid(payload.sub)) {
      throw new ForbiddenException('Invalid user ID in token');
    }

    if (payload.type !== AuthType.INTERNAL) {
      throw new UnauthorizedException('User type not allowed');
    }

    await this.authService.validateRefreshUser(payload.sub);

    return {
      id: payload.sub,
      type: AuthType.INTERNAL,
    };
  }
}
