import { EntityManager, Transactional } from '@mikro-orm/postgresql';
import { BadRequestException, Injectable } from '@nestjs/common';
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

  // findAll() {
  //   return `This action returns all orders`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} order`;
  // }

  // update(id: number, updateOrderDto: UpdateOrderDto) {
  //   return `This action updates a #${id} order`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} order`;
  // }
}
