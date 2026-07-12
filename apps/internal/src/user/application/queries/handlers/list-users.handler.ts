import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListUsersQuery } from '../impl';
import { SortType } from '@app/common';
import { IUserRepository } from '../../../domain/user.repository';

@QueryHandler(ListUsersQuery)
export class ListUsersHandler implements IQueryHandler<ListUsersQuery> {
  constructor(private readonly repo: IUserRepository) {}

  async execute({ args }: ListUsersQuery) {
    return this.repo.findAll({
      search: args.search,
      isActive: args.is_active,
      sort: args.sort,
      sortOrder: args.sort_type === SortType.ASC ? 1 : -1,
      cursor: args.cursor,
      take: args.take,
      direction: args.direction,
    });
  }
}
