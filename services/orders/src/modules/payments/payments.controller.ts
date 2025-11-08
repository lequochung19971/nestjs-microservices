import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreatePaymentDto, ProcessPaymentDto } from 'nest-shared/contracts';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a payment for an order' })
  @ApiResponse({
    status: 201,
    description: 'Payment created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.createPayment(createPaymentDto);
  }

  @Post(':id/process')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Process a payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment processed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment not found',
  })
  async processPayment(
    @Param('id', ParseUUIDPipe) paymentId: string,
    @Body() processPaymentDto: ProcessPaymentDto,
  ) {
    return this.paymentsService.processPayment(paymentId, processPaymentDto);
  }

  @Post(':id/fail')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mark a payment as failed' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment marked as failed',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment not found',
  })
  async failPayment(
    @Param('id', ParseUUIDPipe) paymentId: string,
    @Body('reason') reason?: string,
  ) {
    return this.paymentsService.failPayment(paymentId, reason);
  }

  @Get('order/:orderId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get payments for an order' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiResponse({
    status: 200,
    description: 'List of payments',
  })
  async getPaymentsByOrder(@Param('orderId', ParseUUIDPipe) orderId: string) {
    return this.paymentsService.getPaymentsByOrder(orderId);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment details',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment not found',
  })
  async getPayment(@Param('id', ParseUUIDPipe) paymentId: string) {
    return this.paymentsService.getPayment(paymentId);
  }
}
