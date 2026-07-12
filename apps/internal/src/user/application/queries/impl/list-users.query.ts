import { IQuery } from '@nestjs/cqrs';
import { ListUserDto } from '../../dto/list-user.dto';

export class ListUsersQuery implements IQuery {
  constructor(public readonly args: ListUserDto) {}
}
