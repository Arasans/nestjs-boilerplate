import { INestApplicationContext } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PERMISSION } from '../role/domain/permission.enum';
import { Seeder } from './seeder.interface';

const allPermissions = Object.values(PERMISSION).filter(
  (v) => typeof v === 'string',
);

const ROLES = [
  { name: 'Super Admin', permissions: allPermissions, isPrimary: true },
  {
    name: 'Admin',
    permissions: allPermissions.filter((p) => !p.startsWith('ROLE:')),
    isPrimary: false,
  },
  {
    name: 'User',
    permissions: allPermissions.filter((p) => p.endsWith(':READ')),
    isPrimary: false,
  },
];

export const roleSeeder: Seeder = {
  name: 'role',
  async run(app: INestApplicationContext) {
    const roleModel = app.get<Model<any>>(getModelToken('Role'));

    for (const role of ROLES) {
      await roleModel.updateOne(
        { name: role.name },
        { $setOnInsert: role },
        { upsert: true },
      );
      console.log(`Role "${role.name}" seeded`);
    }
  },
};
