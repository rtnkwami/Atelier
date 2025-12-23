import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ProductsService } from 'src/products/products.service';
import { CartsService } from 'src/carts/carts.service';
import { OrderStatusEnum } from 'src/generated/prisma/enums';
import { OrdersSearchDto } from './dto/search-orders.dto';
import { Prisma } from 'src/generated/prisma/client';

@Injectable()
export class OrdersService {
    constructor(
        private prisma: PrismaService,
        private productService: ProductsService,
        private cartsService: CartsService,
    ) {}

    async createOrder(userId: string) {
        const cartKey = `cart-${userId}`;
        const userCart = await this.cartsService.getCart(cartKey);

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

    async searchOrders(
        filters?: OrdersSearchDto,
        userId?: string,
        page: number = 1,
        limit: number = 20,
    ) {
        const skip = (page - 1) * limit;

        const where: Prisma.OrderWhereInput = {
            userId,
            status: filters?.status,
            createdAt: filters?.dateRange && {
                gte: filters.dateRange.from,
                lte: filters.dateRange.to,
            },
        };

        const [orders, totalOrders] = await Promise.all([
            this.prisma.order.findMany({ where, skip, take: limit }),
            this.prisma.order.count({ where }),
        ]);

        return {
            orders: orders.map((order) => ({
                ...order,
                total: order.total.toNumber(),
            })),
            page,
            perPage: limit,
            count: orders.length,
            total: totalOrders,
            totalPages: Math.ceil(totalOrders / limit),
        };
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
