import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListRolesQuery } from '../impl';
import { SortType } from '@app/common';
import { IRoleRepository } from '../../../domain/role.repository';

@QueryHandler(ListRolesQuery)
export class ListRolesHandler implements IQueryHandler<ListRolesQuery> {
  constructor(private readonly repo: IRoleRepository) {}

  async execute({ args }: ListRolesQuery) {
    return this.repo.findAll({
      search: args.search,
      sort: args.sort,
      sortOrder: args.sort_type === SortType.ASC ? 1 : -1,
      cursor: args.cursor,
      take: args.take,
      direction: args.direction,
    });
  }
}
