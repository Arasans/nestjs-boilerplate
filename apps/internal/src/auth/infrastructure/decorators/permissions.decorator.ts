import { SetMetadata } from '@nestjs/common';
import { PERMISSION } from '../../../role/domain/permission.enum';

export const PERMISSIONS_KEY = 'permissions_required';
export const Permissions = (...permissions: PERMISSION[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
