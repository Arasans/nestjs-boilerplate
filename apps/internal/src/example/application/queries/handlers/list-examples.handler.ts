import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListExamplesQuery } from '../impl';
import { SortType, CursorDirection } from '@app/common';
import { IExampleRepository } from '../../../domain/example.repository';

@QueryHandler(ListExamplesQuery)
export class ListExamplesHandler implements IQueryHandler<ListExamplesQuery> {
  constructor(private readonly repo: IExampleRepository) {}

  async execute({ args }: ListExamplesQuery) {
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
