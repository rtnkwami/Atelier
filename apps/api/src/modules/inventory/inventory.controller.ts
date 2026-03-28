import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  Query,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import type { UpdateProduct, CreateProduct, SearchProducts } from 'contracts';
import { CreateProductSchema, SearchProductSchema } from 'contracts';
import { ZodValidationPipe } from 'src/pipes/request.validation.pipe';
import z from 'zod';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CreateProductSchema))
  create(@Body() data: CreateProduct) {
    return this.inventoryService.createProduct(data);
  }

  @Get('search')
  @UsePipes(new ZodValidationPipe(z.string()))
  async quickSearch(@Query('name') name: string) {
    return await this.inventoryService.quickSearch(name);
  }

  @Get('categories')
  async getCategories() {
    return await this.inventoryService.getProductCategories();
  }

  @Get()
  @UsePipes(new ZodValidationPipe(SearchProductSchema))
  search(@Query() query: SearchProducts) {
    return this.inventoryService.search(query);
  }

  @Get(':id')
  @UsePipes(new ZodValidationPipe(z.uuid()))
  getProduct(@Param('id') id: string) {
    return this.inventoryService.getProduct(id);
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(z.uuid()))
  updateProduct(@Param('id') id: string, @Body() data: UpdateProduct) {
    return this.inventoryService.updateProduct(id, data);
  }

  @Delete(':id')
  @UsePipes(new ZodValidationPipe(z.uuid()))
  deleteProduct(@Param('id') id: string) {
    return this.inventoryService.deleteProduct(id);
  }
}
