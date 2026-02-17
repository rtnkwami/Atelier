import {
  EntityManager,
  FilterQuery,
  Transactional,
  wrap,
} from '@mikro-orm/postgresql';
import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreateProduct, SearchProducts, UpdateProduct } from 'contracts';
import { Product } from 'src/entities/product.entity';

@Injectable()
export class InventoryService {
  constructor(private readonly em: EntityManager) {}

  public async createProduct(data: CreateProduct) {
    const product = this.em.create(Product, data);
    await this.em.flush();
    return { success: true, created: product };
  }

  public async search(filters?: SearchProducts, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const search: FilterQuery<Product> = {};

    if (filters?.name) {
      search.name = { $ilike: `%${filters.name}%` };
    }

    if (filters?.category) {
      search.category = filters.category;
    }

    if (filters?.minPrice || filters?.maxPrice) {
      search.price = {};
      if (filters.minPrice) search.price.$gte = filters.minPrice;
      if (filters.maxPrice) search.price.$lte = filters.maxPrice;
    }

    const [results, count] = await this.em.findAndCount(
      Product,
      { ...search },
      { limit, offset },
    );

    return {
      products: results,
      page,
      perPage: limit,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
    };
  }

  public async getProduct(id: string) {
    const product = await this.em.findOne(Product, id);

    if (!product) {
      throw new NotFoundException(`Product ${id} does not exist`);
    }
    return product;
  }

  @Transactional()
  public async updateProduct(id: string, data: UpdateProduct) {
    const product = await this.em.findOne(Product, id);

    if (!product) {
      throw new NotFoundException(`Product ${id} does not exist`);
    }
    wrap(product).assign(data);

    const dto = {
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      stock: product.stock,
      images: product.images,
    };
    return { success: true, updated: dto };
  }

  @Transactional()
  public async deleteProduct(id: string) {
    const product = await this.em.findOne(Product, id);

    if (!product) {
      throw new NotFoundException(`Product ${id} does not exist`);
    }
    this.em.remove(product);

    return { success: true, deleted: product.id };
  }
}
