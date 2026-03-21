import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MikroORM } from '@mikro-orm/postgresql';
import { Test } from '@nestjs/testing';
import { Product } from 'src/entities/product.entity';
import { ReservationItem } from 'src/entities/reservation-item.entity';
import { Reservation } from 'src/entities/reservation.entity';
import { InventoryController } from 'src/inventory/inventory.controller';
import { InventoryService } from 'src/inventory/inventory.service';
import dbConfig from 'src/mikro-orm.config';
import {
  InventorySearchSeeder,
  KNOWN_PRODUCT_NAME,
} from 'test/seeders/inventory-search.seeder';
import emContextManager from 'test/utils/transactional-test.util';
import { beforeAll, it, expect, describe, afterAll } from 'vitest';

describe('Inventory Tests', () => {
  let inventoryController: InventoryController;
  let orm: MikroORM;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        MikroOrmModule.forRoot({
          ...dbConfig,
          clientUrl: process.env.DATABASE_URL,
          autoLoadEntities: true,
          driverOptions: {},
          seeder: {
            path: 'test/seeders',
          },
        }),
        MikroOrmModule.forFeature([Product, Reservation, ReservationItem]),
      ],
      controllers: [InventoryController],
      providers: [InventoryService],
    }).compile();

    inventoryController = moduleRef.get(InventoryController);
    orm = moduleRef.get(MikroORM);
  });

  describe('Product Search', () => {
    beforeAll(async () => {
      await orm.seeder.seed(InventorySearchSeeder);
    });

    afterAll(async () => {
      await orm.schema.refreshDatabase();
    });

    it('should return products given no search filters', async () => {
      await emContextManager(orm.em, async () => {
        const response = await inventoryController.search({});
        expect(response.totalItems).toBeGreaterThan(0);
      });
    });

    it('should return results when searching by name', async () => {
      await emContextManager(orm.em, async () => {
        const response = await inventoryController.search({
          name: KNOWN_PRODUCT_NAME,
        });
        expect(response.totalItems).toBeGreaterThan(0);
        expect(response.products[0].name).toBe(KNOWN_PRODUCT_NAME);
      });
    });

    it('should return accurate results when only min price filter is used ', async () => {
      await emContextManager(orm.em, async () => {
        const response = await inventoryController.search({ minPrice: 10 });
        expect(response.totalItems).toBeGreaterThan(0);

        const productToVerify = response.products[0];
        expect(productToVerify.price).toBeGreaterThanOrEqual(10);
      });
    });

    it('should return accurate results when only max price filter is used ', async () => {
      await emContextManager(orm.em, async () => {
        const response = await inventoryController.search({ maxPrice: 250 });
        expect(response.totalItems).toBeGreaterThan(0);

        const productToVerify = response.products[0];
        expect(productToVerify.price).toBeLessThanOrEqual(250);
      });
    });

    it('should return accurate results when both max and min price filters are used', async () => {
      const maxPrice = 200;
      const minPrice = 10;

      await emContextManager(orm.em, async () => {
        const response = await inventoryController.search({
          minPrice,
          maxPrice,
        });
        expect(response.totalItems).toBeGreaterThan(0);

        const productToVerify = response.products[0];
        expect(productToVerify.price).toBeGreaterThanOrEqual(minPrice);
        expect(productToVerify.price).toBeLessThanOrEqual(maxPrice);
      });
    });
  });
});
