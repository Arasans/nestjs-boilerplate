import { UserEntity } from './user.entity';
import { CursorMeta } from '@app/common';

export interface UserFilter {
  search?: string;
  isActive?: boolean;
  sort?: string;
  sortOrder?: 1 | -1;
  cursor?: string;
  take?: number;
  direction?: 'next' | 'prev';
}

export abstract class IUserRepository {
  abstract findById(id: string): Promise<UserEntity | null>;
  abstract findByUsername(username: string): Promise<UserEntity | null>;
  abstract findAll(
    filter: UserFilter,
  ): Promise<{ data: UserEntity[]; meta: CursorMeta }>;
  abstract create(data: {
    username: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<UserEntity>;
  abstract update(
    id: string,
    data: { username?: string; email?: string; role?: string },
  ): Promise<UserEntity | null>;
  abstract updatePassword(id: string, hashedPassword: string): Promise<boolean>;
  abstract delete(id: string): Promise<boolean>;
  abstract toggleActive(id: string): Promise<UserEntity | null>;
  abstract existsById(id: string): Promise<boolean>;
}
