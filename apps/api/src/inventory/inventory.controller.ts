import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import type { UpdateProduct, CreateProduct, SearchProducts } from 'contracts';
import { CreateProductSchema, SearchProductSchema } from 'contracts';
import { ZodValidationPipe } from 'src/pipes/request.validation.pipe';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CreateProductSchema))
  create(@Body() data: CreateProduct) {
    return this.inventoryService.createProduct(data);
  }

  @Get('search')
  @UsePipes(new ZodValidationPipe(SearchProductSchema))
  search(@Query() query: SearchProducts) {
    return this.inventoryService.search(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() data: UpdateProduct,
  ) {
    return this.inventoryService.updateProduct(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(+id);
  }
}
