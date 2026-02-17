import { Injectable } from '@nestjs/common';
import { CreateProduct, UpdateProduct } from 'contracts';

@Injectable()
export class InventoryService {
  create(data: CreateProduct) {
    return 'This action adds a new inventory';
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
