import {
  Controller,
  Body,
  // Patch,
  // Param,
  // Delete,
  Put,
  UsePipes,
  Get,
  Delete,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { User } from 'src/auth/user.decorator';
import { CreateCartSchema, type Cart } from 'contracts';
import { ZodValidationPipe } from 'src/pipes/request.validation.pipe';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Put()
  @UsePipes(new ZodValidationPipe(CreateCartSchema))
  upsertCart(@User() userId: string, @Body() data: Cart) {
    return this.cartService.upsertCart(userId, data);
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
