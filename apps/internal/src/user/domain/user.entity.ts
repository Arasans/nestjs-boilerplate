import { AuthType } from '@app/common';
import { PERMISSION } from '../../role/domain/permission.enum';

export interface ICurrentUser {
  id: string;
  type: AuthType;
  email: string;
  username: string;
  roleName: string | null;
  permissions: PERMISSION[];
  role: {
    id: string;
    name: string;
    permissions: PERMISSION[];
  } | null;
}

export class UserEntity {
  id: string;
  email: string;
  username: string;
  password: string;
  isActive: boolean;
  role: {
    id: string;
    name: string;
    permissions: PERMISSION[];
  } | null;
  createdAt: Date;
  updatedAt: Date;

  toCurrentUser(): ICurrentUser {
    return {
      id: this.id,
      type: AuthType.INTERNAL,
      email: this.email,
      username: this.username,
      roleName: this.role?.name ?? null,
      permissions: this.role?.permissions ?? [],
      role: this.role,
    };
  }
}
