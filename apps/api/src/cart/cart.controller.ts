import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UsePipes,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { User } from 'src/auth/user.decorator';
import { CreateCartSchema, type CreateCart } from 'contracts';
import { ZodValidationPipe } from 'src/pipes/request.validation.pipe';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Put()
  @UsePipes(new ZodValidationPipe(CreateCartSchema))
  upsertCart(@User() userId: string, @Body() data: CreateCart) {
    return this.cartService.upsertCart(userId, data);
  }

  @Get()
  findAll() {
    return this.cartService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cartService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cartService.remove(+id);
  }
}
