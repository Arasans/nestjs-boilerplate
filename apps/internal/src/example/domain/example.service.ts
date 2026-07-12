import { Injectable, NotFoundException } from '@nestjs/common';
import { IExampleRepository } from './example.repository';

@Injectable()
export class ExampleService {
  constructor(private readonly repo: IExampleRepository) {}

  async create(data: { name: string; description?: string }) {
    return this.repo.create(data);
  }

  async update(id: string, data: { name?: string; description?: string }) {
    const result = await this.repo.update(id, data);
    if (!result) throw new NotFoundException('Example not found');
    return result;
  }

  async delete(id: string) {
    const result = await this.repo.delete(id);
    if (!result) throw new NotFoundException('Example not found');
  }

  async toggleActive(id: string) {
    const result = await this.repo.toggleActive(id);
    if (!result) throw new NotFoundException('Example not found');
    return result;
  }
}
