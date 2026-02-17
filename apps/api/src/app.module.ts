import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { validate } from './env.validation';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { InventoryModule } from './inventory/inventory.module';
import dbConfig from './mikro-orm.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),
    MikroOrmModule.forRoot(dbConfig),
    InventoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
