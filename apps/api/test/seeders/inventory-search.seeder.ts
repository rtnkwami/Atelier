import { EntityManager } from '@mikro-orm/postgresql';
import { Seeder } from '@mikro-orm/seeder';
import { Product } from 'src/entities/product.entity';
import { faker } from '@faker-js/faker';

export const KNOWN_PRODUCT_NAME = "Niovial's Test Product";

export class InventorySearchSeeder extends Seeder {
  run(em: EntityManager) {
    em.create(Product, {
      name: KNOWN_PRODUCT_NAME,
      description: faker.commerce.productDescription(),
      price: Number(faker.commerce.price()),
      category: faker.commerce.department(),
      stock: faker.number.int({ min: 1, max: 10000 }),
    });

    for (let index = 0; index < 20; index++) {
      em.create(Product, {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: Number(faker.commerce.price()),
        category: faker.commerce.department(),
        stock: faker.number.int({ min: 1, max: 10000 }),
      });
    }
  }
}
