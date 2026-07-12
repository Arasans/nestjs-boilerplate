import { RoleEntity } from './role.entity';
import { PERMISSION } from './permission.enum';
import { CursorMeta } from '@app/common';

export interface RoleFilter {
  search?: string;
  sort?: string;
  sortOrder?: 1 | -1;
  cursor?: string;
  take?: number;
  direction?: 'next' | 'prev';
}

export abstract class IRoleRepository {
  abstract findById(id: string): Promise<RoleEntity | null>;
  abstract findAll(
    filter: RoleFilter,
  ): Promise<{ data: RoleEntity[]; meta: CursorMeta }>;
  abstract create(data: {
    name: string;
    permissions: PERMISSION[];
  }): Promise<RoleEntity>;
  abstract update(
    id: string,
    data: { name?: string; permissions?: PERMISSION[] },
  ): Promise<RoleEntity | null>;
  abstract delete(id: string): Promise<boolean>;
  abstract togglePrimary(id: string): Promise<RoleEntity | null>;
}
