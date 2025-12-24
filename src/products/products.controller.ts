import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    ParseUUIDPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SearchProductDto } from './dto/search-product.dto';

@Controller('products')
export class ProductsController {
    public constructor(private readonly productsService: ProductsService) {}

    @Post()
    private createProduct(@Body() product: CreateProductDto) {
        return this.productsService.createProduct(product);
    }

    @Get()
    private searchProducts(@Query() query: SearchProductDto) {
        return this.productsService.searchProducts(query);
    }

    @Get(':id')
    private findOne(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.productsService.getProduct(id);
    }

    @Patch(':id')
    private updateProduct(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() data: UpdateProductDto,
    ) {
        return this.productsService.updateProduct(id, data);
    }

    @Delete(':id')
    private remove(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.productsService.deleteProduct(id);
    }
}
