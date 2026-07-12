// Usage: pnpm seed [seeder...]
// Examples: pnpm seed role | pnpm seed user | pnpm seed role user | pnpm seed (all)
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ALL_SEEDERS } from './seeders';

async function seed() {
  const args = process.argv.slice(2);
  const available = ALL_SEEDERS.map((s) => s.name);

  let seeders = ALL_SEEDERS;
  if (args.length > 0) {
    const unknown = args.filter((a) => !available.includes(a));
    if (unknown.length > 0) {
      console.error(
        `Unknown seeder(s): ${unknown.join(', ')}\nAvailable: ${available.join(', ')}`,
      );
      process.exit(1);
    }
    seeders = ALL_SEEDERS.filter((s) => args.includes(s.name));
  }

  const app = await NestFactory.createApplicationContext(AppModule);

  for (const seeder of seeders) {
    console.log(`\n--- Running "${seeder.name}" seeder ---`);
    await seeder.run(app);
  }

  await app.close();
  console.log('\nSeed completed');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
