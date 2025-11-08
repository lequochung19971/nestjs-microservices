import {
  Body,
  Controller,
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
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateOrderDto,
  UpdateOrderDto,
  QueryOrderRequestDto,
  QueryOrderResponseDto,
  OrderDto,
  ApiQueryResponse,
} from 'nest-shared/contracts';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    type: OrderDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  async create(
    @Body() dto: CreateOrderDto,
    @Req() req: Request,
  ): Promise<OrderDto> {
    this.logger.log(`Creating order for customer: ${dto.customerId}`);
    return this.ordersService.create(dto, req.headers);
  }

  @Get()
  @ApiOperation({ summary: 'List orders with filtering and pagination' })
  @ApiQueryResponse(OrderDto)
  @ApiResponse({
    status: 200,
    description: 'List of orders',
    type: QueryOrderResponseDto,
  })
  async findAll(
    @Query() query: QueryOrderRequestDto,
    @Req() req: Request,
  ): Promise<QueryOrderResponseDto> {
    this.logger.log(`Finding all orders with query: ${JSON.stringify(query)}`);
    return this.ordersService.findAll(query, req.headers);
  }

  @Get('number/:orderNumber')
  @ApiOperation({ summary: 'Get order by order number' })
  @ApiParam({ name: 'orderNumber', description: 'Order number' })
  @ApiResponse({
    status: 200,
    description: 'Order details',
    type: OrderDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  async findByOrderNumber(
    @Param('orderNumber') orderNumber: string,
    @Req() req: Request,
  ): Promise<OrderDto> {
    this.logger.log(`Finding order by number: ${orderNumber}`);
    return this.ordersService.findByOrderNumber(orderNumber, req.headers);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({
    status: 200,
    description: 'Order details',
    type: OrderDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<OrderDto> {
    this.logger.log(`Finding order with id: ${id}`);
    return this.ordersService.findOne(id, req.headers);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({
    status: 200,
    description: 'Order updated successfully',
    type: OrderDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderDto,
    @Req() req: Request,
  ): Promise<OrderDto> {
    this.logger.log(`Updating order with id: ${id}`);
    return this.ordersService.update(id, dto, req.headers);
  }

  @Post(':id/cancel')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cancel order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({
    status: 200,
    description: 'Order cancelled successfully',
    type: OrderDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot cancel order',
  })
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason?: string,
    @Req() req?: Request,
  ): Promise<OrderDto> {
    this.logger.log(`Cancelling order with id: ${id}`);
    return this.ordersService.cancel(id, reason, req.headers);
  }
}
