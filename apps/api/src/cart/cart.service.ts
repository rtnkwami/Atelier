import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-redis/client';
import type { RedisClientType } from 'redis';
import { Cart } from 'contracts';

@Injectable()
export class CartService {
  constructor(
    @InjectRedis()
    private readonly redis: RedisClientType,
  ) {}
  private readonly redisPrefix = 'cart';

  private aggregateCart(cart: Cart) {
    const total = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const itemCount = cart.items.reduce(
      (count, item) => count + item.quantity,
      0,
    );

    return {
      items: cart.items,
      total,
      itemCount,
    };
  }

  private mergeIncomingWithCurrentCart(incoming: Cart, existing: Cart) {
    const currentCart = new Map(existing.items.map((item) => [item.id, item]));

    for (const incomingItem of incoming.items) {
      const existingItem = currentCart.get(incomingItem.id);

      if (!existingItem) {
        currentCart.set(incomingItem.id, incomingItem);
        continue;
      }

      currentCart.set(incomingItem.id, {
        ...existingItem,
        quantity: existingItem.quantity + incomingItem.quantity,
      });
    }
    return Array.from(currentCart.values());
  }

  upsertCart(key: string, data: CreateCart) {
    return `This action updates a #${id} cart`;
  }

  remove(id: number) {
    return `This action removes a #${id} cart`;
  }
}
