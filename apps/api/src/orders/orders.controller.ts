import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  // Get,
  Post,
  Query,
  // Patch,
  // Param,
  // Delete,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
// import { UpdateOrderDto } from './dto/update-order.dto';
import { User } from 'src/auth/user.decorator';
import type { SearchOrders } from 'contracts';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@User() userId: string) {
    return this.ordersService.createOrder(userId);
  }

  @Get()
  search(@User() userId: string, @Query() query: SearchOrders) {
    return this.ordersService.search(userId, query);
  }

  @Get(':id')
  getOrder(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.ordersService.getOrder(id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
  //   return this.ordersService.update(+id, updateOrderDto);
  // } this function will only be used by admins when implemented.
}
