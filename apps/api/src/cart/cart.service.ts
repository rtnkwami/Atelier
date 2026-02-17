import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-redis/client';
import type { RedisClientType } from 'redis';
import { CreateCart } from 'contracts';

@Injectable()
export class CartService {
  constructor(
    @InjectRedis()
    private readonly redis: RedisClientType,
  ) {}
  private readonly redisPrefix = 'cart';

  private aggregateCart(data: CreateCart) {
    const total = data.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const itemCount = data.items.reduce(
      (count, item) => count + item.quantity,
      0,
    );

    return {
      items: data.items,
      total,
      itemCount,
    };
  }

  upsertCart(key: string, data: CreateCart) {
    return `This action updates a #${id} cart`;
  }

  remove(id: number) {
    return `This action removes a #${id} cart`;
  }
}
