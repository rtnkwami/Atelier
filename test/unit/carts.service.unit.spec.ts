import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Cache } from 'cache-manager';
import { CartsService } from 'src/carts/carts.service';
import { CartItem, CreateCartDto } from 'src/carts/dto/create-cart.dto';
import { beforeEach, it, expect, describe, vi, afterEach } from 'vitest';

describe('Cart Service', () => {
    let service: CartsService;
    let cacheManager: Cache;

    beforeEach(async () => {
        const mockCacheManager = {
            get: vi.fn(),
            set: vi.fn(),
            del: vi.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CartsService,
                {
                    provide: CACHE_MANAGER,
                    useValue: mockCacheManager,
                },
            ],
        }).compile();
        service = module.get<CartsService>(CartsService);
        cacheManager = module.get<Cache>(CACHE_MANAGER);
    });

    describe('aggregateCart', () => {
        it('should accurately calculate the price total and item count for items in cart', () => {
            const data: CreateCartDto = {
                items: [
                    {
                        id: '1',
                        name: 'Item 1',
                        price: 10,
                        quantity: 2,
                        image: 'randomUrl',
                    },
                    {
                        id: '2',
                        name: 'Item 2',
                        price: 5,
                        quantity: 3,
                        image: 'randomUrl',
                    },
                    {
                        id: '3',
                        name: 'Item 3',
                        price: 20,
                        quantity: 1,
                        image: 'randomUrl',
                    },
                ],
            };
            expect(service['aggregateCart'](data).total).toBe(55);
            expect(service['aggregateCart'](data).itemCount).toBe(6);
            expect(service['aggregateCart'](data).items).toEqual(data.items);
        });
    });

    describe('mergeIncomingWithCurrentCart', () => {
        it('should merge items with same id by adding quantities', () => {
            const currentCart: CartItem[] = [
                {
                    id: '1',
                    name: 'Item 1',
                    price: 10,
                    quantity: 2,
                    image: 'url1',
                },
                {
                    id: '2',
                    name: 'Item 2',
                    price: 5,
                    quantity: 1,
                    image: 'url2',
                },
            ];

            const incomingCart: CartItem[] = [
                {
                    id: '1',
                    name: 'Item 1',
                    price: 10,
                    quantity: 3,
                    image: 'url1',
                },
            ];

            expect(
                service['mergeIncomingWithCurrentCart'](
                    incomingCart,
                    currentCart,
                ),
            ).toHaveLength(2);
            expect(
                service['mergeIncomingWithCurrentCart'](
                    incomingCart,
                    currentCart,
                ).find((item) => item.id === '1')?.quantity,
            ).toBe(5);
            expect(
                service['mergeIncomingWithCurrentCart'](
                    incomingCart,
                    currentCart,
                ).find((item) => item.id === '2')?.quantity,
            ).toBe(1);
        });

        it('should add new items that do not exist in the current cart', () => {
            const currentCart: CartItem[] = [
                {
                    id: '1',
                    name: 'Item 1',
                    price: 10,
                    quantity: 2,
                    image: 'url1',
                },
            ];

            const incomingCart: CartItem[] = [
                {
                    id: '2',
                    name: 'Item 2',
                    price: 5,
                    quantity: 3,
                    image: 'url2',
                },
            ];

            expect(
                service['mergeIncomingWithCurrentCart'](
                    incomingCart,
                    currentCart,
                ),
            ).toHaveLength(2);
            expect(
                service['mergeIncomingWithCurrentCart'](
                    incomingCart,
                    currentCart,
                ).find((item) => item.id === '2'),
            ).toEqual({
                id: '2',
                name: 'Item 2',
                price: 5,
                quantity: 3,
                image: 'url2',
            });
        });

        it('should handle multiple duplicate items in incoming cart', () => {
            const currentCart: CartItem[] = [
                {
                    id: '1',
                    name: 'Item 1',
                    price: 10,
                    quantity: 2,
                    image: 'url1',
                },
            ];

            const incomingCart: CartItem[] = [
                {
                    id: '1',
                    name: 'Item 1',
                    price: 10,
                    quantity: 1,
                    image: 'url1',
                },
                {
                    id: '1',
                    name: 'Item 1',
                    price: 10,
                    quantity: 2,
                    image: 'url1',
                },
            ];

            expect(
                service['mergeIncomingWithCurrentCart'](
                    incomingCart,
                    currentCart,
                ),
            ).toHaveLength(1);
            expect(
                service['mergeIncomingWithCurrentCart'](
                    incomingCart,
                    currentCart,
                )[0].quantity,
            ).toBe(5);
        });
    });

    describe('updateCart', () => {
        afterEach(() => {
            vi.restoreAllMocks();
        });

        it('should create a new cart when no cart exists', async () => {
            const userId = 'user123';
            const data: CreateCartDto = {
                items: [
                    {
                        id: '1',
                        name: 'Item 1',
                        price: 10,
                        quantity: 2,
                        image: 'url1',
                    },
                ],
            };
            cacheManager.get = vi.fn().mockResolvedValue(null);

            const result = await service.updateCart(userId, data);

            expect(cacheManager.get).toHaveBeenCalledWith(`cart${userId}`);
            expect(cacheManager.set).toHaveBeenCalledTimes(1);
            expect(result).toBeDefined();
        });

        it('should throw an error if cart is empty', async () => {
            const userId = '123';
            const data: CreateCartDto = { items: [] };

            await expect(
                service.updateCart(userId, data),
            ).rejects.toBeInstanceOf(InternalServerErrorException);
        });
    });
});
