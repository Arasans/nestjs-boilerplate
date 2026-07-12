import { IQuery } from '@nestjs/cqrs';
import { ListExampleDto } from '../../dto/list-example.dto';

export class ListExamplesQuery implements IQuery {
  constructor(public readonly args: ListExampleDto) {}
}
