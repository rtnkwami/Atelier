import { Controller, Body, Put, Get, Delete, Patch } from '@nestjs/common';
import { CartService } from './cart.service';
import { User } from 'src/decorators/user.decorator';
import { CreateCartSchema, type Cart } from 'contracts';
import { ZodValidationPipe } from 'src/pipes/request.validation.pipe';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Put()
  upsertCart(
    @User() userId: string,
    @Body(new ZodValidationPipe(CreateCartSchema)) data: Cart,
  ) {
    return this.cartService.upsertCart(userId, data);
  }

  @Patch('merge')
  syncCart(
    @User() userId: string,
    @Body(new ZodValidationPipe(CreateCartSchema)) data: Cart,
  ) {
    return this.cartService.syncCart(userId, data);
  }

  @Get()
  getCart(@User() userId: string) {
    return this.cartService.getCart(userId);
  }

  @Delete()
  deleteCart(@User() userId: string) {
    return this.cartService.deleteCart(userId);
  }
}
