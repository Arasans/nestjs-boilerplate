import {
  RoleEntity,
  CreateRoleData,
  UpdateRoleData,
} from './role.entity';
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
  abstract create(data: CreateRoleData): Promise<RoleEntity>;
  abstract update(
    id: string,
    data: UpdateRoleData,
  ): Promise<RoleEntity | null>;
  abstract delete(id: string): Promise<boolean>;
  abstract togglePrimary(id: string): Promise<RoleEntity | null>;
}
