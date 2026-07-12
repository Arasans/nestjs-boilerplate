import { Seeder } from '@app/common';
import { roleSeeder } from './role.seeder';
import { userSeeder } from './user.seeder';

// Order matters: role must run before user
export const ALL_SEEDERS: Seeder[] = [roleSeeder, userSeeder];
