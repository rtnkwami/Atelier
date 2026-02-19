import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  // Get,
  Post,
  Query,
  UsePipes,
  // Patch,
  // Param,
  // Delete,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
// import { UpdateOrderDto } from './dto/update-order.dto';
import { User } from 'src/auth/user.decorator';
import { OrdersSearchSchema, type SearchOrders } from 'contracts';
import { ZodValidationPipe } from 'src/pipes/request.validation.pipe';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@User() userId: string) {
    return this.ordersService.createOrder(userId);
  }

  @Get()
  @UsePipes(new ZodValidationPipe(OrdersSearchSchema))
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
