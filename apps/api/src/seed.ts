import { MikroORM } from '@mikro-orm/postgresql';
import 'dotenv/config';
import { InventoryProductSeeder } from './database/seeders/inventory.seeder';

void (async () => {
  const orm = await MikroORM.init({
    clientUrl: process.env.DATABASE_URL,
    entities: ['./dist/database/entities/*.js'],
    driverOptions: {
      connection: { ssl: { rejectUnauthorized: false } },
    },
    seeder: {
      path: './dist/database/seeders',
    },
  });
  await orm.seeder.seed(InventoryProductSeeder);
  await orm.close(true);
})();
// hello test
