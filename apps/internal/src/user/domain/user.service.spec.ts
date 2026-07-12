import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { IUserRepository } from './user.repository';
import { UserEntity } from './user.entity';

function makeUser(overrides: Partial<UserEntity> = {}): UserEntity {
  const u = new UserEntity();
  u.id = '507f1f77bcf86cd799439011';
  u.email = 'test@test.com';
  u.username = 'testuser';
  u.password = 'hashed';
  u.isActive = true;
  u.role = null;
  Object.assign(u, overrides);
  return u;
}

describe('UserService', () => {
  let service: UserService;
  let repo: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: IUserRepository,
          useValue: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            toggleActive: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(UserService);
    repo = module.get(IUserRepository);
  });

  describe('create', () => {
    it('should hash password and create user', async () => {
      repo.create.mockResolvedValue(makeUser());

      await service.create({
        username: 'testuser',
        email: 'test@test.com',
        password: 'plaintext',
      });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'testuser',
          email: 'test@test.com',
          password: expect.not.stringMatching('plaintext'),
        }),
      );
    });
  });

  describe('update', () => {
    it('should return updated user', async () => {
      repo.update.mockResolvedValue(makeUser({ username: 'updated' }));
      const result = await service.update('id', { username: 'updated' });
      expect(result.username).toBe('updated');
    });

    it('should throw NotFoundException when user not found', async () => {
      repo.update.mockResolvedValue(null);
      await expect(service.update('id', { username: 'x' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      repo.delete.mockResolvedValue(true);
      await expect(service.delete('id')).resolves.toBeUndefined();
    });

    it('should throw NotFoundException when user not found', async () => {
      repo.delete.mockResolvedValue(false);
      await expect(service.delete('id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('toggleActive', () => {
    it('should toggle user active status', async () => {
      repo.toggleActive.mockResolvedValue(makeUser({ isActive: false }));
      const result = await service.toggleActive('id');
      expect(result.isActive).toBe(false);
    });

    it('should throw NotFoundException when user not found', async () => {
      repo.toggleActive.mockResolvedValue(null);
      await expect(service.toggleActive('id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
