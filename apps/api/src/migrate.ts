import { MikroORM } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';
import 'dotenv/config';

void (async () => {
  const orm = await MikroORM.init({
    extensions: [Migrator],
    clientUrl: process.env.DATABASE_URL,
    entities: ['./dist/entities/*.js'],
    migrations: {
      path: './dist/migrations',
      transactional: true,
    },
  });

  const migrator = orm.getMigrator();
  await migrator.up();

  await orm.close(true);
})();
// test
