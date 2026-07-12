import { INestApplicationContext } from '@nestjs/common';

export interface Seeder {
  name: string;
  run(app: INestApplicationContext): Promise<void>;
}
