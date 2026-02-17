import {
  EntityManager,
  FilterQuery,
  LockMode,
  Transactional,
  wrap,
} from '@mikro-orm/postgresql';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  CommitStockRequest,
  CreateProduct,
  ReleaseStockRequest,
  ReserveStockRequest,
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
      return {
        error: {
          id: product.id,
          requested: requestedQty,
          stock: product.stock - reservedStock,
        },
      };
    }
    return { product };
  }

  @Transactional()
  public async reserveInventory(data: ReserveStockRequest) {
    type ReservationErrors = {
      id: string;
      requested: number;
      stock: number;
    };

    const sortedRequestItems = [...data.products].sort((a, b) =>
      a.id.localeCompare(b.id),
    );
    const reservation = await this.findOrCreateReservation(data.reservationId);

    const reservationItems: ReservationItem[] = [];
    const errors: ReservationErrors[] = [];

    for (const requested of sortedRequestItems) {
      const { product, error } = await this.validateProductStock(
        requested.id,
        requested.quantity,
      );

      if (error) {
        errors.push(error);
        continue;
      }

      if (product) {
        const item = new ReservationItem();
        item.product = product;
        item.quantity = requested.quantity;
        item.reservation = reservation;

        reservationItems.push(item);
      }
    }
    if (errors.length > 0) {
      return {
        success: false,
        error: {
          message: 'insufficient stock for one or more products',
          reason: errors,
        },
      };
    }
    reservation.items.set(reservationItems);

    return {
      success: true,
      data: {
        reservationId: data.reservationId,
        created: reservation.createdAt,
        expires: reservation.expiresAt,
      },
    };
  }

  @Transactional()
  public async commitInventoryReservation(data: CommitStockRequest) {
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

    return {
      reservationId: data.reservationId,
      committedAt: new Date(),
      affectedProducts: products,
    };
  }

  @Transactional()
  public async releaseInventory(data: ReleaseStockRequest) {
    const reservation = await this.em.findOne(
      Reservation,
      { id: data.reservationId },
      { populate: ['items'] },
    );

    if (!reservation) {
      throw new NotFoundException(
        `Reservation ${data.reservationId} does not exist`,
      );
    }

    const affectedProducts = reservation.items.map((item) => ({
      id: item.id,
      releasedStock: item.quantity,
    }));

    this.em.remove(reservation);

    return {
      reservationId: data.reservationId,
      affectedProducts,
    };
  }
}
