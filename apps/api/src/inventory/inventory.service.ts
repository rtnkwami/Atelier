import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { CreateProduct, UpdateProduct } from 'contracts';
import { Product } from 'src/entities/product.entity';

@Injectable()
export class InventoryService {
  constructor(private readonly em: EntityManager) {}

  public async create(data: CreateProduct) {
    const product = this.em.create(Product, data);
    await this.em.flush();
    return product;
  }

  findAll() {
    return `This action returns all inventory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} inventory`;
  }

  update(id: number, data: UpdateProduct) {
    return `This action updates a #${id} inventory`;
  }

  remove(id: number) {
    return `This action removes a #${id} inventory`;
  }
}
