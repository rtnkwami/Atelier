import { MikroORM } from '@mikro-orm/postgresql';
import 'dotenv/config';
import { InventoryProductSeeder } from './seeders/inventory.seeder';

void (async () => {
  const orm = await MikroORM.init({
    clientUrl: process.env.DATABASE_URL,
    entities: ['./dist/entities/*.js'],
    driverOptions: {
      connection: { ssl: { rejectUnauthorized: false } },
    },
    seeder: {
      path: './dist/seeders',
    },
  });
  await orm.seeder.seed(InventoryProductSeeder);
  await orm.close(true);
})();
