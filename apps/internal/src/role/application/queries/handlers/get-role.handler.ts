import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetRoleQuery } from '../impl';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { IRoleRepository } from '../../../domain/role.repository';

@QueryHandler(GetRoleQuery)
export class GetRoleHandler implements IQueryHandler<GetRoleQuery> {
  constructor(private readonly repo: IRoleRepository) {}

  async execute({ id }: GetRoleQuery) {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }

    const role = await this.repo.findById(id);
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }
}
