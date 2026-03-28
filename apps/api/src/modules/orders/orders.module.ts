import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { CartModule } from 'src/modules/cart/cart.module';
import { InventoryModule } from 'src/modules/inventory/inventory.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Order } from 'src/entities/order.entity';
import { OrderItem } from 'src/entities/order-item.entity';

@Module({
  imports: [
    CartModule,
    InventoryModule,
    MikroOrmModule.forFeature([Order, OrderItem]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
