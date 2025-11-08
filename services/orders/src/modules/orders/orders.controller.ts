import {
  Body,
  Controller,
  Get,
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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import {
  ApiQueryResponse,
  CreateOrderDto,
  OrderDto,
  QueryOrderRequestDto,
  QueryOrderResponseDto,
  UpdateOrderDto,
} from 'nest-shared/contracts';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
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
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: Request,
  ): Promise<OrderDto> {
    return this.ordersService.create(createOrderDto, req.headers);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List orders with filtering and pagination' })
  @ApiQueryResponse(OrderDto)
  @ApiResponse({
    status: 200,
    description: 'List of orders',
    type: QueryOrderResponseDto,
  })
  async findAll(
    @Query() query: QueryOrderRequestDto,
  ): Promise<QueryOrderResponseDto> {
    return this.ordersService.findAll(query);
  }

  @Get('number/:orderNumber')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
  ): Promise<OrderDto> {
    return this.ordersService.findByOrderNumber(orderNumber);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<OrderDto> {
    return this.ordersService.findOne(id);
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
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<OrderDto> {
    return this.ordersService.update(id, updateOrderDto);
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
  ): Promise<OrderDto> {
    return this.ordersService.cancel(id, reason);
  }
}
