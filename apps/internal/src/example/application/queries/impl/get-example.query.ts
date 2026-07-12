import { IQuery } from '@nestjs/cqrs';

export class GetExampleQuery implements IQuery {
  constructor(public readonly id: string) {}
}
