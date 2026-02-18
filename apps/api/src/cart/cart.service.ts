import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { type Cart } from 'contracts';

@Injectable()
export class CartService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  private mergeIncomingWithExistingCart(incoming: Cart, existing: Cart) {
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
    const cart: Cart = { items: [] };
    const mergedItems = Array.from(currentCart.values());
    cart.items = mergedItems;
    return cart;
  }

  public async upsertCart(key: string, incoming: Cart) {
    const existing = await this.cacheManager.get<Cart>(key);

    if (!existing) {
      const cart = await this.cacheManager.set<Cart>(key, incoming);
      return cart;
    }
    const mergedCart = this.mergeIncomingWithExistingCart(incoming, existing);
    return await this.cacheManager.set<Cart>(key, mergedCart);
  }

  // remove(id: number) {
  //   return `This action removes a #${id} cart`;
  // }
}
