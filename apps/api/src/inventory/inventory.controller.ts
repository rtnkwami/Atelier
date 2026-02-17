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
import type {
  UpdateProduct,
  CreateProduct,
  SearchProducts,
  ReserveStockRequest,
} from 'contracts';
import {
  CreateProductSchema,
  ReserveStockRequestSchema,
  SearchProductSchema,
} from 'contracts';
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
  getProduct(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.inventoryService.getProduct(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() data: UpdateProduct,
  ) {
    return this.inventoryService.updateProduct(id, data);
  }

  @Delete(':id')
  deleteProduct(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.inventoryService.deleteProduct(id);
  }

  @Post('reservation')
  @UsePipes(new ZodValidationPipe(ReserveStockRequestSchema))
  reserveInventory(@Body() data: ReserveStockRequest) {
    return this.inventoryService.reserveInventory(data);
  }
}
