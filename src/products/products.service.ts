import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma.service';
import { SearchProductDto } from './dto/search-product.dto';
import { Prisma } from 'src/generated/prisma/client';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) {}

    createProduct(data: CreateProductDto) {
        return this.prisma.product.create({ data });
    }

    async searchProducts(
        filters?: SearchProductDto,
        page: number = 1,
        limit: number = 20,
    ) {
        const skip = (page - 1) * limit;

        const where: Prisma.ProductWhereInput = {
            name: filters?.name && {
                contains: filters.name,
                mode: 'insensitive',
            },
            category: filters?.category,

            price: {
                gte: filters?.minPrice,
                lte: filters?.maxPrice,
            },

            stock: {
                gte: filters?.minStock,
                lte: filters?.maxStock,
            },
        };

        const [products, totalItems] = await Promise.all([
            this.prisma.product.findMany({ where, skip, take: limit }),
            this.prisma.product.count({ where }),
        ]);

        return {
            products: products.map((product) => ({
                ...product,
                price: product.price.toNumber(),
            })),
            page,
            perPage: limit,
            count: products.length,
            total: totalItems,
            totalPages: Math.ceil(totalItems / limit),
        };
    }

    getProduct(id: string) {
        return this.prisma.product.findUniqueOrThrow({ where: { id } });
    }

    updateProduct(id: string, data: UpdateProductDto) {
        return this.prisma.product.update({ where: { id }, data });
    }

    deleteProduct(id: string) {
        return this.prisma.product.delete({ where: { id } });
    }
}
