import { AuthType } from '@app/common';
import { UserEntity } from './user.entity';

describe('UserEntity', () => {
  describe('toCurrentUser', () => {
    it('should map entity with role to ICurrentUser', () => {
      const entity = new UserEntity();
      entity.id = '123';
      entity.email = 'a@b.com';
      entity.username = 'user1';
      entity.password = 'hashed';
      entity.isActive = true;
      entity.role = { id: 'r1', name: 'admin', permissions: [] };

      const result = entity.toCurrentUser();

      expect(result).toEqual({
        id: '123',
        type: AuthType.INTERNAL,
        email: 'a@b.com',
        username: 'user1',
        roleName: 'admin',
        permissions: [],
        role: { id: 'r1', name: 'admin', permissions: [] },
      });
    });

    it('should map entity without role to ICurrentUser with null role', () => {
      const entity = new UserEntity();
      entity.id = '123';
      entity.email = 'a@b.com';
      entity.username = 'user1';
      entity.password = 'hashed';
      entity.isActive = true;
      entity.role = null;

      const result = entity.toCurrentUser();

      expect(result).toEqual({
        id: '123',
        type: AuthType.INTERNAL,
        email: 'a@b.com',
        username: 'user1',
        roleName: null,
        permissions: [],
        role: null,
      });
    });
  });
});
