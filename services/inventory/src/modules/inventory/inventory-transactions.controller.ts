import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiQueryResponse,
  BaseQueryResponse,
  CreateInventoryTransactionDto,
  InventoryTransactionDto,
  QueryInventoryTransactionRequest,
} from 'nest-shared/contracts';
import { InventoryTransactionsService } from './inventory-transactions.service';

@ApiTags('inventory-transactions')
@Controller('inventory-transactions')
export class InventoryTransactionsController {
  constructor(
    private readonly inventoryTransactionsService: InventoryTransactionsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new inventory transaction' })
  @ApiResponse({
    status: 201,
    description: 'Inventory transaction created successfully',
    type: InventoryTransactionDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 404,
    description: 'Inventory item not found',
  })
  async create(
    @Body() createTransactionDto: CreateInventoryTransactionDto,
  ): Promise<InventoryTransactionDto> {
    return this.inventoryTransactionsService.create(createTransactionDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List inventory transactions with filtering and pagination',
  })
  @ApiQuery({
    type: QueryInventoryTransactionRequest,
  })
  @ApiQueryResponse(InventoryTransactionDto)
  async findAll(
    @Query() query: QueryInventoryTransactionRequest,
  ): Promise<BaseQueryResponse<InventoryTransactionDto>> {
    return this.inventoryTransactionsService.findAll(query);
  }

  @Get('item/:inventoryItemId')
  @ApiOperation({ summary: 'Get transactions for a specific inventory item' })
  @ApiParam({ name: 'inventoryItemId', description: 'Inventory item ID' })
  @ApiResponse({
    status: 200,
    description: 'Transactions for inventory item',
    type: [InventoryTransactionDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Inventory item not found',
  })
  async findByInventoryItem(
    @Param('inventoryItemId', ParseUUIDPipe) inventoryItemId: string,
  ): Promise<InventoryTransactionDto[]> {
    return this.inventoryTransactionsService.findByInventoryItem(
      inventoryItemId,
    );
  }

  @Get('item/:inventoryItemId/summary')
  @ApiOperation({ summary: 'Get transaction summary for an inventory item' })
  @ApiParam({ name: 'inventoryItemId', description: 'Inventory item ID' })
  @ApiResponse({
    status: 200,
    description: 'Transaction summary',
    schema: {
      type: 'object',
      properties: {
        totalPurchases: { type: 'number' },
        totalSales: { type: 'number' },
        totalReturns: { type: 'number' },
        totalAdjustments: { type: 'number' },
        totalTransfers: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Inventory item not found',
  })
  async getTransactionSummary(
    @Param('inventoryItemId', ParseUUIDPipe) inventoryItemId: string,
  ) {
    return this.inventoryTransactionsService.getTransactionSummary(
      inventoryItemId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get inventory transaction by ID' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({
    status: 200,
    description: 'Transaction details',
    type: InventoryTransactionDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Transaction not found',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<InventoryTransactionDto> {
    return this.inventoryTransactionsService.findOne(id);
  }
}
