import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaService } from 'src/prisma.service';
import { ProductsModule } from 'src/products/products.module';
import { CartsModule } from 'src/carts/carts.module';

@Module({
    imports: [ProductsModule, CartsModule],
    controllers: [OrdersController],
    providers: [OrdersService, PrismaService],
})
export class OrdersModule {}
