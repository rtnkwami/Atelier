import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Product } from 'src/database/entities/product.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Product])],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
