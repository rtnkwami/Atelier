import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ProductsService } from 'src/products/products.service';
import { CartsService } from 'src/carts/carts.service';
import { OrderStatusEnum } from 'src/generated/prisma/enums';

@Injectable()
export class OrdersService {
    constructor(
        private prisma: PrismaService,
        private productService: ProductsService,
        private cartsService: CartsService,
    ) {}

    async createOrder(userId: string) {
        const userCart = await this.cartsService.getCart(`cart-${userId}`);

        if (!userCart) {
            throw new BadRequestException(
                'Cart is empty. No products to place an order',
            );
        }

        return this.prisma.$transaction(async (tx) => {
            await Promise.all(
                userCart.items.map(async (item) => {
                    const { hasStock, requestedStock, currentStock } =
                        await this.productService.checkIfProductHasSufficentStock(
                            item.id,
                            item.quantity,
                        );
                    if (!hasStock) {
                        throw new BadRequestException(
                            `Insufficient stock for product ${item.name}. Available ${currentStock}, Requested: ${requestedStock}`,
                        );
                    }
                }),
            );

            // Array of product stock decrease promises for simultaneous execution
            await Promise.all(
                userCart.items.map((item) =>
                    tx.product.update({
                        where: { id: item.id },
                        data: { stock: { decrement: item.quantity } },
                    }),
                ),
            );

            const order = await tx.order.create({
                data: {
                    userId,
                    total: userCart.total,
                },
            });

            // Array of order item creation promises for simultaneous execution
            await Promise.all(
                userCart.items.map((item) =>
                    tx.orderItem.create({
                        data: {
                            orderId: order.id,
                            productId: item.id,
                            quantity: item.quantity,
                            priceAtTime: item.price,
                        },
                    }),
                ),
            );
            // Cart info is no longer needed, so clear cart
            await this.cartsService.clearCart(cartKey);
            return { ...order };
        });
    }

    findAll() {
        return `This action returns all orders`;
    }

    findOne(id: number) {
        return `This action returns a #${id} order`;
    }

    updateOrderStatus(id: string, status: OrderStatusEnum) {
        return this.prisma.order.update({
            where: { id },
            data: { status },
            select: { id: true, status: true },
        });
    }
}
