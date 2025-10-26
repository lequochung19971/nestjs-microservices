import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  AdjustQuantityDto,
  ApiQueryResponse,
  BaseQueryResponse,
  CreateInventoryItemDto,
  InventoryItemDto,
  QueryInventoryItemRequest,
  UpdateInventoryItemDto,
} from 'nest-shared/contracts';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { InventoryItemsService } from './inventory-items.service';

@ApiTags('inventory-items')
@Controller('inventory-items')
export class InventoryItemsController {
  constructor(private readonly inventoryItemsService: InventoryItemsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new inventory item' })
  @ApiResponse({
    status: 201,
    description: 'Inventory item created successfully',
    type: InventoryItemDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 404,
    description: 'Warehouse not found',
  })
  async create(
    @Body() createInventoryItemDto: CreateInventoryItemDto,
  ): Promise<InventoryItemDto> {
    return this.inventoryItemsService.create(createInventoryItemDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List inventory items with filtering and pagination',
  })
  @ApiQuery({
    type: QueryInventoryItemRequest,
  })
  @ApiQueryResponse(InventoryItemDto)
  async findAll(
    @Query() query: QueryInventoryItemRequest,
  ): Promise<BaseQueryResponse<InventoryItemDto>> {
    return this.inventoryItemsService.findAll(query);
  }

  @Get('warehouse/:warehouseId')
  @ApiOperation({ summary: 'Get inventory items by warehouse' })
  @ApiParam({ name: 'warehouseId', description: 'Warehouse ID' })
  @ApiResponse({
    status: 200,
    description: 'Inventory items in warehouse',
    type: [InventoryItemDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Warehouse not found',
  })
  async findByWarehouse(
    @Param('warehouseId', ParseUUIDPipe) warehouseId: string,
  ): Promise<InventoryItemDto[]> {
    return this.inventoryItemsService.findByWarehouse(warehouseId);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get inventory items by product' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Inventory items for product',
    type: [InventoryItemDto],
  })
  async findByProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
  ): Promise<InventoryItemDto[]> {
    return this.inventoryItemsService.findByProduct(productId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get inventory item by ID' })
  @ApiParam({ name: 'id', description: 'Inventory item ID' })
  @ApiResponse({
    status: 200,
    description: 'Inventory item details',
    type: InventoryItemDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Inventory item not found',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<InventoryItemDto> {
    return this.inventoryItemsService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update inventory item' })
  @ApiParam({ name: 'id', description: 'Inventory item ID' })
  @ApiResponse({
    status: 200,
    description: 'Inventory item updated successfully',
    type: InventoryItemDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Inventory item not found',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateInventoryItemDto: UpdateInventoryItemDto,
  ): Promise<InventoryItemDto> {
    return this.inventoryItemsService.update(id, updateInventoryItemDto);
  }

  @Put(':id/quantity')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Adjust inventory item quantity' })
  @ApiParam({ name: 'id', description: 'Inventory item ID' })
  @ApiResponse({
    status: 200,
    description: 'Quantity adjusted successfully',
    type: InventoryItemDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Insufficient stock or validation failed',
  })
  @ApiResponse({
    status: 404,
    description: 'Inventory item not found',
  })
  async adjustQuantity(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() adjustQuantityDto: AdjustQuantityDto,
  ): Promise<InventoryItemDto> {
    return this.inventoryItemsService.adjustQuantity(id, adjustQuantityDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete inventory item' })
  @ApiParam({ name: 'id', description: 'Inventory item ID' })
  @ApiResponse({
    status: 200,
    description: 'Inventory item deleted successfully',
    type: InventoryItemDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Inventory item not found',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<InventoryItemDto> {
    return this.inventoryItemsService.remove(id);
  }
}
