import { EntityManager } from '@mikro-orm/postgresql';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CartService } from 'src/cart/cart.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly em: EntityManager,
    private readonly cartService: CartService,
  ) {}

  private async validateCart(userId: string) {
    const cart = await this.cartService.getCart(userId);

    if (!cart) {
      throw new BadRequestException(
        'Cart is empty. No products to place an order',
      );
    }
    return { cart, userId };
  }

  createOrder(userId: string) {
    return 'This action adds a new order';
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
