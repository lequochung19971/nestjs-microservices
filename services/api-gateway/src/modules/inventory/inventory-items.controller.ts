import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import {
  AdjustQuantityDto,
  ApiQueryResponse,
  CreateInventoryItemDto,
  InventoryItemDto,
  QueryInventoryItemRequest,
  UpdateInventoryItemDto,
} from 'nest-shared/contracts';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { InventoryService } from './inventory.service';

@ApiTags('inventory-items')
@Controller('inventory/items')
export class InventoryItemsController {
  private readonly logger = new Logger(InventoryItemsController.name);

  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new inventory item' })
  @ApiResponse({
    status: 201,
    description: 'The inventory item has been successfully created',
    type: InventoryItemDto,
  })
  async create(@Body() dto: CreateInventoryItemDto, @Req() req: Request) {
    this.logger.log(`Creating inventory item in warehouse: ${dto.warehouseId}`);
    return this.inventoryService.createInventoryItem(dto, req.headers);
  }

  @Get()
  @ApiOperation({ summary: 'Get all inventory items' })
  @ApiQueryResponse(InventoryItemDto, {
    description: 'List of inventory items',
    status: 200,
  })
  async findAll(
    @Query() query: QueryInventoryItemRequest,
    @Req() req: Request,
  ) {
    this.logger.log(`Finding all inventory items`);
    return this.inventoryService.findAllInventoryItems(query, req.headers);
  }

  @Get('warehouse/:warehouseId')
  @ApiOperation({ summary: 'Get inventory items by warehouse' })
  @ApiParam({
    name: 'warehouseId',
    description: 'Warehouse ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'List of inventory items in the warehouse',
    type: [InventoryItemDto],
  })
  async findByWarehouse(
    @Param('warehouseId', ParseUUIDPipe) warehouseId: string,
    @Req() req: Request,
  ) {
    this.logger.log(`Finding inventory items in warehouse: ${warehouseId}`);
    return this.inventoryService.getInventoryItemsByWarehouse(
      warehouseId,
      req.headers,
    );
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get inventory items by product' })
  @ApiParam({
    name: 'productId',
    description: 'Product ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'List of inventory items for the product',
    type: [InventoryItemDto],
  })
  async findByProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Req() req: Request,
  ) {
    this.logger.log(`Finding inventory items for product: ${productId}`);
    return this.inventoryService.getInventoryItemsByProduct(
      productId,
      req.headers,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an inventory item by ID' })
  @ApiParam({ name: 'id', description: 'Inventory Item ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Inventory item details',
    type: InventoryItemDto,
  })
  @ApiResponse({ status: 404, description: 'Inventory item not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    this.logger.log(`Finding inventory item with id: ${id}`);
    return this.inventoryService.getInventoryItemById(id, req.headers);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update an inventory item' })
  @ApiParam({ name: 'id', description: 'Inventory Item ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'The inventory item has been successfully updated',
    type: InventoryItemDto,
  })
  @ApiResponse({ status: 404, description: 'Inventory item not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInventoryItemDto,
    @Req() req: Request,
  ) {
    this.logger.log(`Updating inventory item with id: ${id}`);
    return this.inventoryService.updateInventoryItem(id, dto, req.headers);
  }

  @Put(':id/quantity')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Adjust inventory item quantity' })
  @ApiParam({ name: 'id', description: 'Inventory Item ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'The inventory item quantity has been successfully adjusted',
    type: InventoryItemDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Insufficient stock or invalid adjustment',
  })
  @ApiResponse({ status: 404, description: 'Inventory item not found' })
  async adjustQuantity(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdjustQuantityDto,
    @Req() req: Request,
  ) {
    this.logger.log(
      `Adjusting quantity for inventory item ${id}: ${dto.quantity}`,
    );
    return this.inventoryService.adjustInventoryItemQuantity(
      id,
      dto,
      req.headers,
    );
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete an inventory item' })
  @ApiParam({ name: 'id', description: 'Inventory Item ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'The inventory item has been successfully deleted',
    type: InventoryItemDto,
  })
  @ApiResponse({ status: 404, description: 'Inventory item not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    this.logger.log(`Removing inventory item with id: ${id}`);
    return this.inventoryService.deleteInventoryItem(id, req.headers);
  }
}
