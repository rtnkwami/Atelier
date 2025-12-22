import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SearchProductDto } from './dto/search-product.dto';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Post()
    createProduct(@Body() product: CreateProductDto) {
        return this.productsService.createProduct(product);
    }

    @Get()
    searchProducts(@Query() query: SearchProductDto) {
        return this.productsService.searchProducts(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.productsService.getProduct(id);
    }

    @Patch(':id')
    updateProduct(@Param('id') id: string, @Body() data: UpdateProductDto) {
        return this.productsService.updateProduct(id, data);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.productsService.deleteProduct(id);
    }
}
