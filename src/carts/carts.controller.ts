import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Req,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import type { Request } from 'express';

@Controller('carts')
export class CartsController {
    constructor(private readonly cartsService: CartsService) {}

    @Post()
    updateCart(@Req() request: Request, @Body() data: CreateCartDto) {
        const userId = request.auth?.payload.sub;
        return this.cartsService.updateCart(userId!, data);
    }

    @Get()
    getCart(@Req() request: Request) {
        const userId = request.auth?.payload.sub;
        return this.cartsService.getCart(userId!);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.cartsService.clearCart(id);
    }
}
