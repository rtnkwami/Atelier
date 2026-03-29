import { Migrator } from '@mikro-orm/migrations';
import { MikroORM } from '@mikro-orm/postgresql';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { afterAll, beforeAll } from 'vitest';

let container: StartedPostgreSqlContainer;

beforeAll(async () => {
  container = await new PostgreSqlContainer('postgres:18').start();
  process.env.DATABASE_URL = container.getConnectionUri();

  const orm = await MikroORM.init({
    extensions: [Migrator],
    clientUrl: process.env.DATABASE_URL,
    entities: ['./dist/database/entities/*.js'],
    entitiesTs: ['./src/database/entities'],
    migrations: {
      path: './dist/database/migrations',
      pathTs: './src/database/migrations',
      transactional: true,
    },
  });
  const migrator = orm.getMigrator();
  await migrator.up();
  await orm.close();
}, 20000);

afterAll(async () => {
  await container.stop();
});
