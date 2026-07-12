import { Injectable, NotFoundException } from '@nestjs/common';
import { IRoleRepository } from './role.repository';
import { PERMISSION } from './permission.enum';

@Injectable()
export class RoleService {
  constructor(private readonly repo: IRoleRepository) {}

  async create(data: { name: string; permissions: PERMISSION[] }) {
    return this.repo.create(data);
  }

  async update(
    id: string,
    data: { name?: string; permissions?: PERMISSION[] },
  ) {
    const result = await this.repo.update(id, data);
    if (!result) throw new NotFoundException('Role not found');
    return result;
  }

  async delete(id: string) {
    const result = await this.repo.delete(id);
    if (!result) throw new NotFoundException('Role not found');
  }

  async togglePrimary(id: string) {
    const result = await this.repo.togglePrimary(id);
    if (!result) throw new NotFoundException('Role not found');
    return result;
  }
}
