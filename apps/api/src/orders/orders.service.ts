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
import type { OrderPaymentStatus, SearchOrders } from 'contracts';
import { CartService } from 'src/cart/cart.service';
import { OrderItem } from 'src/entities/order-item.entity';
import { Order } from 'src/entities/order.entity';
import { Product } from 'src/entities/product.entity';
import { User } from 'src/entities/user.entity';
import { InventoryService } from 'src/inventory/inventory.service';

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
  public async createOrder(userId: string) {
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

    const dto = {
      orderId: order.id,
      items: cart.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
      })),
    };
    await this.inventoryService.reserveInventory(dto);

    return { order };
  }

  public async search(userId: string, filters: SearchOrders) {
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

    return {
      orders: results,
      page,
      perPage: limit,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
    };
  }

  public async getOrder(id: string) {
    const order = await this.em.findOne(Order, id, { populate: ['items'] });

    if (!order) {
      throw new NotFoundException(`Order ${id} does not exist`);
    }

    return order;
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
