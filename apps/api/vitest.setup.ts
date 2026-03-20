import { Migrator } from '@mikro-orm/migrations';
import { MikroORM } from '@mikro-orm/postgresql';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { OrderItem } from 'src/entities/order-item.entity';
import { Order } from 'src/entities/order.entity';
import { Product } from 'src/entities/product.entity';
import { User } from 'src/entities/user.entity';
import { afterAll, beforeAll } from 'vitest';

let container: StartedPostgreSqlContainer;

beforeAll(async () => {
  container = await new PostgreSqlContainer('postgres:18').start();
  process.env.DATABASE_URL = container.getConnectionUri();

  const orm = await MikroORM.init({
    extensions: [Migrator],
    clientUrl: process.env.DATABASE_URL,
    entities: [Product, Order, OrderItem, User],
    migrations: {
      path: './dist/migrations',
      pathTs: './src/migrations',
      transactional: true,
    },
  });
  const migrator = orm.getMigrator();
  await migrator.up();
  await orm.close();
});

afterAll(async () => {
  await container.stop();
});
