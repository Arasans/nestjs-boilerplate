// Usage: pnpm seed [seeder...]
// Examples: pnpm seed role | pnpm seed user | pnpm seed role user | pnpm seed (all)
import { runSeeders } from '@app/common';
import { AppModule } from './app.module';
import { ALL_SEEDERS } from './seeders';

runSeeders(AppModule, ALL_SEEDERS).catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
