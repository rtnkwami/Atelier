import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { validate } from './env.validation';
import { AuthMiddleware } from './middleware/auth.middleware';
import { CartsModule } from './carts/carts.module';
import { CacheModule } from '@nestjs/cache-manager';
import { LoggerModule } from 'nestjs-pino';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, validate }),
        CacheModule.register({ isGlobal: true }),
        LoggerModule.forRoot(),
        ProductsModule,
        UsersModule,
        CartsModule,
    ],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AuthMiddleware)
            .exclude(
                { path: 'products', method: RequestMethod.GET },
                { path: 'products/:id', method: RequestMethod.GET },
            )
            .forRoutes('*');
    }
}
