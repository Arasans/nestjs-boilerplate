import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';
import { ICurrentUser, IUserPayload } from '../../domain/auth.types';
import { AuthType } from '@app/common';
import { AuthService } from '../../domain/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly authService: AuthService,
    config: ConfigService,
  ) {
    super({
      passReqToCallback: true,
      ignoreExpiration: false,
      secretOrKey: config.get<string>('AT_SECRET') || '',
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    } satisfies StrategyOptionsWithRequest);
  }

  async validate(req: any, payload: IUserPayload): Promise<ICurrentUser> {
    if (!payload?.sub || !Types.ObjectId.isValid(payload.sub)) {
      throw new UnauthorizedException('Invalid user ID in token');
    }

    if (payload.type !== AuthType.INTERNAL) {
      throw new UnauthorizedException('User type not allowed');
    }

    return this.authService.resolveUser(payload);
  }
}
