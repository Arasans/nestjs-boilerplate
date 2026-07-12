import { INestApplicationContext } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Seeder } from './seeder.interface';

const USERS = [
  {
    username: 'superadmin',
    email: 'superadmin@mail.com',
    password: 'admin123',
    roleName: 'Super Admin',
  },
  {
    username: 'admin',
    email: 'admin@mail.com',
    password: 'admin123',
    roleName: 'Admin',
  },
];

export const userSeeder: Seeder = {
  name: 'user',
  async run(app: INestApplicationContext) {
    const roleModel = app.get<Model<any>>(getModelToken('Role'));
    const userModel = app.get<Model<any>>(getModelToken('User'));

    for (const user of USERS) {
      const exists = await userModel.exists({ username: user.username });
      if (exists) {
        console.log(`User "${user.username}" already exists, skipping`);
        continue;
      }

      const role = await roleModel.findOne({ name: user.roleName }).exec();
      await userModel.create({
        username: user.username,
        email: user.email,
        password: await bcrypt.hash(user.password, 10),
        isActive: true,
        role: role?._id,
      });
      console.log(`User "${user.username}" seeded`);
    }
  },
};
