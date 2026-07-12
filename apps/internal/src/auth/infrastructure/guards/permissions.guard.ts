import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PERMISSION } from '../../../role/domain/permission.enum';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndMerge<
      (PERMISSION | number)[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const userPermissions: string[] =
      user?.role?.permissions || user?.permissions;

    if (!userPermissions || userPermissions.length === 0) {
      throw new ForbiddenException('No permissions found for user');
    }

    const normalizedRequired = requiredPermissions.map((perm) =>
      typeof perm === 'number' ? PERMISSION[perm] : perm,
    );

    const hasPermission = normalizedRequired.some((perm) =>
      userPermissions.includes(perm),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}
