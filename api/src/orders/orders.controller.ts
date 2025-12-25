import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Req,
    Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';

import type { Request } from 'express';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrdersSearchDto } from './dto/search-orders.dto';

@Controller('orders')
export class OrdersController {
    public constructor(private readonly ordersService: OrdersService) {}

    @Post()
    private createOrder(@Req() request: Request) {
        const userId = request.auth?.payload.sub;
        return this.ordersService.createOrder(userId!);
    }

    @Get()
    private searchOrders(
        @Query() query: OrdersSearchDto,
        @Req() request: Request,
    ) {
        const userId = request.auth?.payload.sub;
        return this.ordersService.searchOrders(query, userId);
    }

    @Get(':id')
    private getOrder(@Param('id') id: string) {
        return this.ordersService.getOrder(id);
    }

    @Patch(':id')
    private updateOrderStatus(
        @Param('id') id: string,
        @Body() update: UpdateOrderDto,
    ) {
        const status = update.status;
        return this.ordersService.updateOrderStatus(id, status);
    }
}
