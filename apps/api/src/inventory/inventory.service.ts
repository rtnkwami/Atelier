import {
  EntityManager,
  FilterQuery,
  LockMode,
  Transactional,
  TransactionPropagation,
  wrap,
} from '@mikro-orm/postgresql';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  CommitStock,
  CreateProduct,
  ReserveStock,
  SearchProducts,
  UpdateProduct,
} from 'contracts';
import { Product } from 'src/entities/product.entity';
import { ReservationItem } from 'src/entities/reservation-item.entity';
import { Reservation } from 'src/entities/reservation.entity';

@Injectable()
export class InventoryService {
  constructor(private readonly em: EntityManager) {}

  public async createProduct(data: CreateProduct) {
    const product = this.em.create(Product, data);
    await this.em.flush();
    return { success: true, created: product };
  }

  public async search(filters: SearchProducts) {
    const { page, limit, name, category, minPrice, maxPrice } = filters;
    const offset = (page - 1) * limit;
    const search: FilterQuery<Product> = {};

    if (name) {
      search.name = { $ilike: `%${name}%` };
    }

    if (category) {
      search.category = category;
    }

    if (minPrice || maxPrice) {
      search.price = {};
      if (minPrice) search.price.$gte = minPrice;
      if (maxPrice) search.price.$lte = maxPrice;
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

  private async findOrCreateReservation(id: string) {
    const existing = await this.em.findOne(
      Reservation,
      { id },
      { populate: ['items'] },
    );
    const reservation = existing ?? new Reservation();

    if (!existing) {
      reservation.id = id;
      this.em.persist(reservation);
    }
    return reservation;
  }

  private async validateProductStock(id: string, requestedQty: number) {
    const product = await this.em.findOne(
      Product,
      { id },
      {
        lockMode: LockMode.PESSIMISTIC_WRITE, // use this lock mode to make transactions trying the same operations wait until the first one served finishes.
        populate: ['reservations'],
      },
    );

    if (!product) {
      throw new NotFoundException(`Product ${id} does not exist`);
    }

    const reservedStock = product.reservations.reduce(
      (acc, item) => acc + item.quantity,
      0,
    );
    const totalRequestedStock = reservedStock + requestedQty;

    if (product.stock - totalRequestedStock < 0) {
      throw new BadRequestException({
        message: `insufficient stock for product ${product.id}`,
        reason: {
          requested: requestedQty,
          stock: product.stock - reservedStock,
        },
      });
    }
    return product;
  }

  @Transactional({ propagation: TransactionPropagation.REQUIRED })
  public async reserveInventory(data: ReserveStock) {
    const sortedRequestItems = [...data.items].sort((a, b) =>
      a.id.localeCompare(b.id),
    );
    const reservation = await this.findOrCreateReservation(data.orderId);

    const reservationItems: ReservationItem[] = [];

    for (const requested of sortedRequestItems) {
      const product = await this.validateProductStock(
        requested.id,
        requested.quantity,
      );

      const item = new ReservationItem();
      item.product = product;
      item.quantity = requested.quantity;
      item.reservation = reservation;

      reservationItems.push(item);
    }
    reservation.items.set(reservationItems);

    return { orderId: data.orderId };
  }

  @Transactional({ propagation: TransactionPropagation.REQUIRED })
  public async commitInventoryReservation(data: CommitStock) {
    const reservation = await this.em.findOne(
      Reservation,
      { id: data.reservationId },
      {
        populate: ['items'],
        populateOrderBy: {
          items: {
            product: { id: 'asc' },
          },
        },
      },
    );

    if (!reservation) {
      throw new BadRequestException(
        `Reservation ${data.reservationId} does not exist`,
      );
    }

    const productIds: string[] = [];
    const reservedItems = reservation.items.getItems();

    reservedItems.forEach((item) => {
      productIds.push(item.product.id);
    });

    const products = await this.em.findAll(Product, {
      where: {
        id: { $in: productIds },
      },
      lockMode: LockMode.PESSIMISTIC_WRITE,
    });

    products.forEach((product) => {
      const reservedItem = reservedItems.find(
        (item) => item.product.id === product.id,
      );
      if (reservedItem) {
        product.stock -= reservedItem.quantity;
        reservation.items.remove(reservedItem);
      }
    });
    this.em.remove(reservation);
  }
}
