import { IQuery } from '@nestjs/cqrs';
import { ICurrentUser } from '../../../domain/auth.types';

export class MeQuery implements IQuery {
  constructor(public readonly user: ICurrentUser) {}
}
