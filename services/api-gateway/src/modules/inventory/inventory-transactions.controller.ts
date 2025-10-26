import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  ParseUUIDPipe,
  Post,
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
  ApiQueryResponse,
  CreateInventoryTransactionDto,
  InventoryTransactionDto,
  QueryInventoryTransactionRequest,
} from 'nest-shared/contracts';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { InventoryService } from './inventory.service';

@ApiTags('inventory-transactions')
@Controller('inventory/transactions')
export class InventoryTransactionsController {
  private readonly logger = new Logger(InventoryTransactionsController.name);

  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new inventory transaction' })
  @ApiResponse({
    status: 201,
    description: 'The inventory transaction has been successfully created',
    type: InventoryTransactionDto,
  })
  async create(
    @Body() dto: CreateInventoryTransactionDto,
    @Req() req: Request,
  ) {
    this.logger.log(
      `Creating inventory transaction for item: ${dto.inventoryItemId}`,
    );
    return this.inventoryService.createTransaction(dto, req.headers);
  }

  @Get()
  @ApiOperation({ summary: 'Get all inventory transactions' })
  @ApiQueryResponse(InventoryTransactionDto, {
    status: 200,
    description: 'List of inventory transactions',
  })
  async findAll(
    @Query() query: QueryInventoryTransactionRequest,
    @Req() req: Request,
  ) {
    this.logger.log(`Finding all inventory transactions`);
    return this.inventoryService.findAllTransactions(query, req.headers);
  }

  @Get('inventory-item/:inventoryItemId')
  @ApiOperation({ summary: 'Get transactions by inventory item' })
  @ApiParam({
    name: 'inventoryItemId',
    description: 'Inventory Item ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'List of transactions for the inventory item',
    type: [InventoryTransactionDto],
  })
  async findByInventoryItem(
    @Param('inventoryItemId', ParseUUIDPipe) inventoryItemId: string,
    @Req() req: Request,
  ) {
    this.logger.log(
      `Finding transactions for inventory item: ${inventoryItemId}`,
    );
    return this.inventoryService.getTransactionsByInventoryItem(
      inventoryItemId,
      req.headers,
    );
  }

  @Get('inventory-item/:inventoryItemId/summary')
  @ApiOperation({ summary: 'Get transaction summary for an inventory item' })
  @ApiParam({
    name: 'inventoryItemId',
    description: 'Inventory Item ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction summary for the inventory item',
  })
  async getTransactionSummary(
    @Param('inventoryItemId', ParseUUIDPipe) inventoryItemId: string,
    @Req() req: Request,
  ) {
    this.logger.log(
      `Getting transaction summary for inventory item: ${inventoryItemId}`,
    );
    return this.inventoryService.getTransactionSummary(
      inventoryItemId,
      req.headers,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an inventory transaction by ID' })
  @ApiParam({
    name: 'id',
    description: 'Inventory Transaction ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Inventory transaction details',
    type: InventoryTransactionDto,
  })
  @ApiResponse({ status: 404, description: 'Inventory transaction not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    this.logger.log(`Finding inventory transaction with id: ${id}`);
    return this.inventoryService.getTransactionById(id, req.headers);
  }
}
