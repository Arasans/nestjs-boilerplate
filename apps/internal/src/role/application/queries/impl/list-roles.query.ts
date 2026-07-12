import { IQuery } from '@nestjs/cqrs';
import { ListRoleDto } from '../../dto/list-role.dto';

export class ListRolesQuery implements IQuery {
  constructor(public readonly args: ListRoleDto) {}
}
