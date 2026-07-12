import { NestFactory } from '@nestjs/core';
import { Seeder } from './seeder.interface';

export async function runSeeders(appModule: any, allSeeders: Seeder[]) {
  const args = process.argv.slice(2);
  const available = allSeeders.map((s) => s.name);

  let seeders = allSeeders;
  if (args.length > 0) {
    const unknown = args.filter((a) => !available.includes(a));
    if (unknown.length > 0) {
      console.error(
        `Unknown seeder(s): ${unknown.join(', ')}\nAvailable: ${available.join(', ')}`,
      );
      process.exit(1);
    }
    seeders = allSeeders.filter((s) => args.includes(s.name));
  }

  const app = await NestFactory.createApplicationContext(appModule);

  for (const seeder of seeders) {
    console.log(`\n--- Running "${seeder.name}" seeder ---`);
    await seeder.run(app);
  }

  await app.close();
  console.log('\nSeed completed');
}
