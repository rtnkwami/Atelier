import {
    Inject,
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import { CartItem, CreateCartDto } from './dto/create-cart.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { type Cache } from 'cache-manager';

type CartDto = {
    items: CartItem[];
    itemCount: number;
    total: number;
};

@Injectable()
export class CartsService {
    constructor(
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache,
    ) {}

    private aggregateCart(data: CreateCartDto) {
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

    private mergeIncomingWithCurrentCart(
        incomingCart: CartItem[],
        currentCart: CartItem[],
    ) {
        const cart = new Map(currentCart.map((item) => [item.id, item]));

        // deduplicate items in cart by increasing quantities
        incomingCart.forEach((item) => {
            if (cart.has(item.id)) {
                const existingItem = cart.get(item.id)!;
                cart.set(item.id, {
                    ...existingItem,
                    quantity: existingItem.quantity + item.quantity,
                });
            } else {
                cart.set(item.id, item);
            }
        });
        return Array.from(cart.values());
    }

    async updateCart(id: string, data: CreateCartDto) {
        const cartKey = `cart${id}`;
        const currentCart = await this.cacheManager.get<CartDto>(cartKey);

        if (!currentCart) {
            const cart = this.aggregateCart(data);
            return this.cacheManager.set<CartDto>(cartKey, cart);
        }

        const mergedCart = {
            items: this.mergeIncomingWithCurrentCart(
                data.items,
                currentCart?.items,
            ),
        };
        const userCart = this.aggregateCart(mergedCart);

        await this.cacheManager.set<CreateCartDto>(cartKey, userCart);

        if (!userCart) {
            throw new InternalServerErrorException(
                'Unable to add items to cart. Cart is empty',
            );
        }

        return userCart;
    }

    getCart(id: string) {
        const cartKey = `cart-${id}`;
        return this.cacheManager.get<CreateCartDto>(cartKey);
    }

    clearCart(id: string) {
        const cartKey = `cart-${id}`;
        return this.cacheManager.del(cartKey);
    }
}
