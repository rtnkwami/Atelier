import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) {}

    createProduct(data: CreateProductDto) {
        return this.prisma.product.create({ data });
    }

    findAll() {
        return `This action returns all products`;
    }

    findOne(id: number) {
        return `This action returns a #${id} product`;
    }

    update(id: string, data: UpdateProductDto) {
        return this.prisma.product.update({
            where: { id },
            data,
        });
    }

    remove(id: number) {
        return `This action removes a #${id} product`;
    }
}
