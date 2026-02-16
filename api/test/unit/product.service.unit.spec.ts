import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { PrismaService } from 'src/prisma.service';
import { ProductsService } from 'src/products/products.service';
import { beforeEach, it, expect, describe, vi } from 'vitest';

describe('Product Service', () => {
    let service: ProductsService;

    const prismaMock = {
        product: {
            findUniqueOrThrow: vi.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProductsService,
                {
                    provide: PrismaService,
                    useValue: prismaMock,
                },
            ],
        }).compile();

        service = module.get(ProductsService);
    });

    describe('checkIfProductHasSufficientStock', () => {
        const mockProduct = {
            id: randomUUID(),
            name: 'ErgoFlex Mechanical Keyboard',
            description:
                'A low-profile mechanical keyboard designed for long coding sessions. Features hot-swappable switches, RGB backlighting, and an aluminum frame.',
            price: 129.99,
            category: 'Electronics',
            stock: 42,
            images: [
                'https://cdn.example.com/products/ergoflex-keyboard/front.jpg',
                'https://cdn.example.com/products/ergoflex-keyboard/angle.jpg',
            ],
        };

        it('should return false if current is less than desired', async () => {
            prismaMock.product.findUniqueOrThrow.mockResolvedValue(mockProduct);
            const { hasStock } = await service.checkIfProductHasSufficentStock(
                mockProduct.id,
                100,
            );

            expect(hasStock).toBe(false);
        });

        it('should return false if current is less than desired', async () => {
            prismaMock.product.findUniqueOrThrow.mockResolvedValue(mockProduct);
            const { hasStock } = await service.checkIfProductHasSufficentStock(
                mockProduct.id,
                10,
            );

            expect(hasStock).toBe(true);
        });
    });
});
