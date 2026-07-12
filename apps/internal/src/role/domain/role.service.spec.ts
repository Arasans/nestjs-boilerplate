import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RoleService } from './role.service';
import { IRoleRepository } from './role.repository';
import { RoleEntity } from './role.entity';

function makeRole(overrides: Partial<RoleEntity> = {}): RoleEntity {
  const r = new RoleEntity();
  r.id = '507f1f77bcf86cd799439011';
  r.name = 'admin';
  r.permissions = [];
  r.isPrimary = false;
  r.createdAt = new Date();
  r.updatedAt = new Date();
  Object.assign(r, overrides);
  return r;
}

describe('RoleService', () => {
  let service: RoleService;
  let repo: jest.Mocked<IRoleRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RoleService,
        {
          provide: IRoleRepository,
          useValue: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            togglePrimary: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(RoleService);
    repo = module.get(IRoleRepository);
  });

  describe('create', () => {
    it('should create role', async () => {
      repo.create.mockResolvedValue(makeRole());
      const result = await service.create({ name: 'admin', permissions: [] });
      expect(result.name).toBe('admin');
    });
  });

  describe('update', () => {
    it('should return updated role', async () => {
      repo.update.mockResolvedValue(makeRole({ name: 'editor' }));
      const result = await service.update('id', { name: 'editor' });
      expect(result.name).toBe('editor');
    });

    it('should throw NotFoundException when role not found', async () => {
      repo.update.mockResolvedValue(null);
      await expect(service.update('id', { name: 'x' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete role', async () => {
      repo.delete.mockResolvedValue(true);
      await expect(service.delete('id')).resolves.toBeUndefined();
    });

    it('should throw NotFoundException when role not found', async () => {
      repo.delete.mockResolvedValue(false);
      await expect(service.delete('id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('togglePrimary', () => {
    it('should toggle role primary status', async () => {
      repo.togglePrimary.mockResolvedValue(makeRole({ isPrimary: true }));
      const result = await service.togglePrimary('id');
      expect(result.isPrimary).toBe(true);
    });

    it('should throw NotFoundException when role not found', async () => {
      repo.togglePrimary.mockResolvedValue(null);
      await expect(service.togglePrimary('id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
