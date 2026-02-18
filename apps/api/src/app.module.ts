import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { validate } from './env.validation';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { InventoryModule } from './inventory/inventory.module';
import { CartModule } from './cart/cart.module';
import dbConfig from './mikro-orm.config';
import { AuthMiddleware } from './auth/auth.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),
    MikroOrmModule.forRoot(dbConfig),
    InventoryModule,
    CartModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  private configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'inventory', method: RequestMethod.GET },
        { path: 'inventory/:id', method: RequestMethod.GET },
        { path: 'inventory/search', method: RequestMethod.GET },
      )
      .forRoutes('*');
  }
}
