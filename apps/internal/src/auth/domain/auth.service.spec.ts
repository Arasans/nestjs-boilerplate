import { Test } from '@nestjs/testing';
import {
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { IUserRepository } from '../../user/domain/user.repository';
import { UserCacheService } from './user-cache.service';
import { UserEntity } from '../../user/domain/user.entity';
import { AuthType } from '@app/common';
import { ICurrentUser, IUserPayload } from './auth.types';

function makeUser(overrides: Partial<UserEntity> = {}): UserEntity {
  const u = new UserEntity();
  u.id = '507f1f77bcf86cd799439011';
  u.email = 'test@test.com';
  u.username = 'testuser';
  u.password = bcrypt.hashSync('password123', 10);
  u.isActive = true;
  u.role = { id: 'role1', name: 'admin', permissions: [] };
  Object.assign(u, overrides);
  return u;
}

function makeCurrentUser(user = makeUser()): ICurrentUser {
  return user.toCurrentUser();
}

describe('AuthService', () => {
  let service: AuthService;
  let repo: jest.Mocked<IUserRepository>;
  let cacheService: jest.Mocked<UserCacheService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: IUserRepository,
          useValue: {
            findByUsername: jest.fn(),
            findById: jest.fn(),
            updatePassword: jest.fn(),
            existsById: jest.fn(),
          },
        },
        {
          provide: UserCacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn().mockResolvedValue(true),
            del: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn().mockResolvedValue('token') },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) =>
              key === 'AT_SECRET' ? 'at-secret' : 'rt-secret',
            ),
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    repo = module.get(IUserRepository);
    cacheService = module.get(UserCacheService);
  });

  describe('login', () => {
    it('should return tokens when credentials valid', async () => {
      const user = makeUser();
      repo.findByUsername.mockResolvedValue(user);

      const result = await service.login('testuser', 'password123');

      expect(result).toEqual({ access_token: 'token', refresh_token: 'token' });
      expect(repo.findByUsername).toHaveBeenCalledWith('testuser');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      repo.findByUsername.mockResolvedValue(null);
      await expect(service.login('nobody', 'pass')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when password wrong', async () => {
      repo.findByUsername.mockResolvedValue(makeUser());
      await expect(service.login('testuser', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should cache user after successful login', async () => {
      repo.findByUsername.mockResolvedValue(makeUser());
      await service.login('testuser', 'password123');
      expect(cacheService.set).toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('should return tokens for existing user', async () => {
      repo.findById.mockResolvedValue(makeUser());
      const result = await service.refresh('507f1f77bcf86cd799439011');
      expect(result).toEqual({ access_token: 'token', refresh_token: 'token' });
    });

    it('should throw NotFoundException when user not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.refresh('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('resetPassword', () => {
    it('should hash password, update via repo, invalidate cache, return tokens', async () => {
      const user = makeUser();
      repo.findById.mockResolvedValue(user);
      repo.updatePassword.mockResolvedValue(true);

      const result = await service.resetPassword(user.id, 'newpass123');

      expect(result).toEqual({ access_token: 'token', refresh_token: 'token' });
      expect(repo.updatePassword).toHaveBeenCalledWith(
        user.id,
        expect.any(String),
      );
      expect(cacheService.del).toHaveBeenCalledWith(user.id);
    });

    it('should throw BadRequestException when user not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.resetPassword('missing', 'newpass')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('resolveUser', () => {
    const payload: IUserPayload = {
      sub: '507f1f77bcf86cd799439011',
      username: 'testuser',
      iat: 0,
      exp: 0,
      type: AuthType.INTERNAL,
    };

    it('should return cached user when available', async () => {
      const cached = makeCurrentUser();
      cacheService.get.mockResolvedValue(cached);

      const result = await service.resolveUser(payload);

      expect(result).toBe(cached);
      expect(repo.findById).not.toHaveBeenCalled();
    });

    it('should fetch from DB on cache miss and cache result', async () => {
      cacheService.get.mockResolvedValue(null);
      repo.findById.mockResolvedValue(makeUser());

      const result = await service.resolveUser(payload);

      expect(result.id).toBe('507f1f77bcf86cd799439011');
      expect(cacheService.set).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user not found in DB', async () => {
      cacheService.get.mockResolvedValue(null);
      repo.findById.mockResolvedValue(null);
      await expect(service.resolveUser(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateRefreshUser', () => {
    it('should pass when user exists', async () => {
      repo.existsById.mockResolvedValue(true);
      await expect(service.validateRefreshUser('id')).resolves.toBeUndefined();
    });

    it('should throw UnauthorizedException when user not found', async () => {
      repo.existsById.mockResolvedValue(false);
      await expect(service.validateRefreshUser('id')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
