import { AuthType } from '@app/common';
import { PERMISSION } from '../../role/domain/permission.enum';

export interface IUserPayload {
  sub: string;
  username: string;
  iat: number;
  exp: number;
  type: AuthType;
}

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

export interface ICurrentUserRt {
  id: string;
  type: AuthType;
}
