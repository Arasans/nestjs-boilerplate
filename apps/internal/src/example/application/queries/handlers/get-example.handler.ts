import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetExampleQuery } from '../impl';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { IExampleRepository } from '../../../domain/example.repository';

@QueryHandler(GetExampleQuery)
export class GetExampleHandler implements IQueryHandler<GetExampleQuery> {
  constructor(private readonly repo: IExampleRepository) {}

  async execute({ id }: GetExampleQuery) {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }

    const example = await this.repo.findById(id);
    if (!example) throw new NotFoundException('Example not found');
    return example;
  }
}
