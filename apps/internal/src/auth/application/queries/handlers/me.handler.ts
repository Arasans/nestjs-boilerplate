import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MeQuery } from '../impl';

@QueryHandler(MeQuery)
export class MeHandler implements IQueryHandler<MeQuery> {
  async execute(query: MeQuery) {
    const { user } = query;
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }
}
