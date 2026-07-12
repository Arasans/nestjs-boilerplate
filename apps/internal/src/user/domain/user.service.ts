import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IUserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly repo: IUserRepository) {}

  async create(data: {
    username: string;
    email: string;
    password: string;
    role?: string;
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.repo.create({ ...data, password: hashedPassword });
  }

  async update(
    id: string,
    data: { username?: string; email?: string; role?: string },
  ) {
    const result = await this.repo.update(id, data);
    if (!result) throw new NotFoundException('User not found');
    return result;
  }

  async delete(id: string) {
    const result = await this.repo.delete(id);
    if (!result) throw new NotFoundException('User not found');
  }

  async toggleActive(id: string) {
    const result = await this.repo.toggleActive(id);
    if (!result) throw new NotFoundException('User not found');
    return result;
  }
}
