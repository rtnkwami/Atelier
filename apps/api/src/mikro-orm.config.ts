import { Migrator } from '@mikro-orm/migrations';
import { defineConfig } from '@mikro-orm/postgresql';
import 'dotenv/config';

export default defineConfig({
  migrations: {
    path: './dist/migrations',
    pathTs: './src/migrations',
  },
  extensions: [Migrator],
  clientUrl: process.env.DATABASE_URL,
  connect: false,
  driverOptions: {
    // adding this ssl setting is a "temporary fix" to allow the api to communicate with
    // RDS without hiccups.
    connection: { ssl: { rejectUnauthorized: false } },
  },
});
