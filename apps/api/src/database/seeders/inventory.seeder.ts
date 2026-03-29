import { faker } from '@faker-js/faker';
import { EntityManager } from '@mikro-orm/postgresql';
import { Seeder } from '@mikro-orm/seeder';
import { Product } from 'src/database/entities/product.entity';

export class InventoryProductSeeder extends Seeder {
  run(em: EntityManager) {
    for (let index = 0; index < 50; index++) {
      em.create(Product, {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: Number(faker.commerce.price()),
        category: faker.commerce.department(),
        stock: faker.number.int({ min: 1, max: 100 }),
        images: [faker.image.urlPicsumPhotos()],
      });
    }
  }
}
