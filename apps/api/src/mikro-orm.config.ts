import { Migrator } from '@mikro-orm/migrations';
import { defineConfig } from '@mikro-orm/postgresql';
import 'dotenv/config';

export default defineConfig({
  entities: ['./dist/database/entities/*.js'],
  migrations: {
    path: './dist/database/migrations',
    pathTs: './src/database/migrations',
  },
  extensions: [Migrator],
  clientUrl: process.env.DATABASE_URL,
  connect: false,
  driverOptions: {
    connection: { ssl: { rejectUnauthorized: false } },
  },
});
