import { PERMISSION } from './permission.enum';

export class RoleEntity {
  id: string;
  name: string;
  permissions: PERMISSION[];
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}
