import { PERMISSION } from './permission.enum';

export class RoleEntity {
  id: string;
  name: string;
  permissions: PERMISSION[];
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateRoleData = Pick<RoleEntity, 'name' | 'permissions'>;
export type UpdateRoleData = Partial<CreateRoleData>;
