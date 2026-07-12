import { Injectable, NotFoundException } from '@nestjs/common';
import { IRoleRepository } from './role.repository';
import { CreateRoleData, UpdateRoleData } from './role.entity';

@Injectable()
export class RoleService {
  constructor(private readonly repo: IRoleRepository) {}

  async create(data: CreateRoleData) {
    return this.repo.create(data);
  }

  async update(id: string, data: UpdateRoleData) {
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
