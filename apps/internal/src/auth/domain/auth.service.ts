import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthType } from '@app/common';
import { IUserRepository } from '../../user/domain/user.repository';
import { ICurrentUser, IUserPayload } from './auth.types';
import { UserCacheService } from './user-cache.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly userRepo: IUserRepository,
    private readonly userCacheService: UserCacheService,
  ) {}

  async login(username: string, password: string) {
    const user = await this.userRepo.findByUsername(username);

    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('username/password is wrong');
    }

    const currentUser = user.toCurrentUser();
    this.cacheUser(currentUser);

    return this.generateTokens({
      id: user.id,
      username: user.username,
      roleName: user.role?.name,
    });
  }

  async refresh(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    return this.generateTokens({
      id: user.id,
      username: user.username,
      roleName: user.role?.name,
    });
  }

  async resetPassword(userId: string, newPassword: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new BadRequestException('Invalid data');

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.userRepo.updatePassword(userId, hashed);
    await this.userCacheService.del(userId);

    return this.generateTokens({
      id: user.id,
      username: user.username,
      roleName: user.role?.name,
    });
  }

  async resolveUser(payload: IUserPayload): Promise<ICurrentUser> {
    const cached = await this.userCacheService.get(payload.sub);
    if (cached && cached.role !== undefined) return cached;

    this.logger.debug(`Cache miss for user ${payload.sub}, fetching from DB`);

    const user = await this.userRepo.findById(payload.sub);
    if (!user) throw new UnauthorizedException('User not found');

    const currentUser = user.toCurrentUser();
    this.cacheUser(currentUser);

    return currentUser;
  }

  async validateRefreshUser(userId: string): Promise<void> {
    const exists = await this.userRepo.existsById(userId);
    if (!exists) throw new UnauthorizedException('User not found');
  }

  private async generateTokens(user: {
    id: string;
    username: string;
    roleName?: string;
  }) {
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.roleName,
      type: AuthType.INTERNAL,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('AT_SECRET'),
        expiresIn: '24h',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('RT_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  private cacheUser(user: ICurrentUser): void {
    this.userCacheService.set(user).catch((err: unknown) => {
      this.logger.warn(`Failed to cache user: ${(err as Error).message}`);
    });
  }
}
