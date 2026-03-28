import {
  EntityManager,
  Transactional,
  FilterQuery,
} from '@mikro-orm/postgresql';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  CreateOrderResponse,
  OrderPaymentStatus,
  SearchOrders,
  SearchOrdersResponse,
} from 'contracts';
import { CartService } from 'src/modules/cart/cart.service';
import { OrderItem } from 'src/entities/order-item.entity';
import { Order } from 'src/entities/order.entity';
import { Product } from 'src/entities/product.entity';
import { User } from 'src/entities/user.entity';
import { InventoryService } from 'src/modules/inventory/inventory.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly em: EntityManager,
    private readonly cartService: CartService,
    private readonly inventoryService: InventoryService,
  ) {}

  private async validateCart(userId: string) {
    const cart = await this.cartService.getCart(userId);

    if (!cart) {
      throw new BadRequestException(
        'Cart is empty. No products to place an order',
      );
    }
    return cart;
  }

  @Transactional()
  public async createOrder(userId: string): Promise<CreateOrderResponse> {
    const cart = await this.validateCart(userId);
    const cartTotal = cart.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );

    const order = new Order();
    order.total = cartTotal;
    order.user = this.em.getReference(User, userId);
    this.em.persist(order);

    for (const item of cart.items) {
      const orderItem = new OrderItem();
      orderItem.price = item.price;
      orderItem.quantity = item.quantity;
      orderItem.product = this.em.getReference(Product, item.id);

      order.items.add(orderItem);
    }

    const reserveInventoryDto = {
      orderId: order.id,
      items: cart.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
      })),
    };
    await this.inventoryService.reserveInventory(reserveInventoryDto);

    const returnDto = {
      id: order.id,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
    };

    return returnDto;
  }

  public async search(
    userId: string,
    filters: SearchOrders,
  ): SearchOrdersResponse {
    const { page = 1, limit = 20, status, fromDate, toDate } = filters;
    const offset = (page - 1) * limit;

    const search: FilterQuery<Order> = { user: { id: userId } };

    if (status) {
      search.status = status;
    }

    if (fromDate || toDate) {
      search.createdAt = {};
      if (fromDate) search.createdAt.$gte = fromDate;
      if (toDate) search.createdAt.$lte = toDate;
    }

    const [results, count] = await this.em.findAndCount(
      Order,
      { ...search },
      { limit, offset },
    );

    const dto = results.map((order) => ({
      id: order.id,
      status: order.status,
      total: order.total,
      createdAt: order.createdAt.toISOString(),
    }));

    return {
      orders: dto,
      page,
      perPage: limit,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
    };
  }

  public async getOrder(id: string) {
    const order = await this.em.findOne(Order, id, {
      populate: ['items'],
      fields: [
        'status',
        'total',
        'createdAt',
        'items.quantity',
        'items.price',
        'items.product.id',
      ],
    } as const);

    if (!order) {
      throw new NotFoundException(`Order ${id} does not exist`);
    }

    const dto = {
      id: order.id,
      status: order.status,
      total: order.total,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((item) => ({
        id: item.product.id,
        quantity: item.quantity,
        price: item.price,
      })),
    };
    return dto;
  }

  @Transactional()
  public async changePaymentStatus(id: string, data: OrderPaymentStatus) {
    const order = await this.em.findOne(Order, id);

    if (!order) {
      throw new NotFoundException(`Order ${id} does not exist`);
    }

    order.status = data.status;

    return order;
  }
}
