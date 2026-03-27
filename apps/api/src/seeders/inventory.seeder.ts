import { faker } from '@faker-js/faker';
import { EntityManager } from '@mikro-orm/postgresql';
import { Seeder } from '@mikro-orm/seeder';
import { Product } from 'src/entities/product.entity';

export class InventoryProductSeeder extends Seeder {
  run(em: EntityManager) {
    em.create(Product, {
      name: faker.commerce.product(),
      description: faker.commerce.productDescription(),
      price: Number(faker.commerce.price()),
      category: faker.commerce.department(),
      stock: faker.number.int({ min: 1, max: 100 }),
      images: [faker.image.urlPicsumPhotos()],
    });
  }
}
