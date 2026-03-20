import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MikroORM } from '@mikro-orm/postgresql';
import { Test } from '@nestjs/testing';
import { Product } from 'src/entities/product.entity';
import { ReservationItem } from 'src/entities/reservation-item.entity';
import { Reservation } from 'src/entities/reservation.entity';
import { InventoryController } from 'src/inventory/inventory.controller';
import { InventoryService } from 'src/inventory/inventory.service';
import dbConfig from 'src/mikro-orm.config';
import autoRollback from 'test/utils/transactional-test.util';
import { beforeAll, it, expect, describe } from 'vitest';

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
        }),
        MikroOrmModule.forFeature([Product, Reservation, ReservationItem]),
      ],
      controllers: [InventoryController],
      providers: [InventoryService],
    }).compile();

    inventoryController = moduleRef.get(InventoryController);
    orm = moduleRef.get(MikroORM);
  });

  describe('create, update, delete tests', () => {
    const testProduct = {
      name: 'Test Product',
      description: 'A test product',
      price: 10.99,
      category: 'Tests',
      stock: 2000,
    };

    it('should create a product', async () => {
      await autoRollback(orm.em, async () => {
        const response = await inventoryController.create(testProduct);

        expect(response).toBeDefined();
        expect(response.name).toBe('Test Product');
      });
    });

    it('should get a product', async () => {
      await autoRollback(orm.em, async () => {
        const product = await inventoryController.create(testProduct);
        const response = await inventoryController.getProduct(product.id);

        expect(response.name).toBe(product.name);
        expect(response.price).toBe(product.price);
      });
    });

    it('should delete a product', async () => {
      await autoRollback(orm.em, async () => {
        const product = await inventoryController.create(testProduct);
        const inventoryBeforeDelete = await inventoryController.search({
          page: 1,
          limit: 5,
        });
        await inventoryController.deleteProduct(product.id);
        const inventoryAfterDelete = await inventoryController.search({
          page: 1,
          limit: 5,
        });

        expect(inventoryBeforeDelete.totalItems).toBeGreaterThan(0);
        expect(inventoryAfterDelete.totalItems).toBe(0);
      });
    });
  });
});
