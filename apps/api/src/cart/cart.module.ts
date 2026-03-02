import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import KeyvRedis from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: () => ({
        stores: [
          new KeyvRedis(
            process.env.REDIS_ENDPOINT || 'redis://localhost:6379',
            {
              namespace: 'cart',
            },
          ),
        ],
        ttl: 7 * 24 * 60 * 60 * 1000,
      }),
    }),
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
