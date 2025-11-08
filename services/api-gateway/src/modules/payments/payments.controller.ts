import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  ParseUUIDPipe,
  Post,
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
  CreatePaymentDto,
  ProcessPaymentDto,
  PaymentDto,
} from 'nest-shared/contracts';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a payment for an order' })
  @ApiResponse({
    status: 201,
    description: 'Payment created successfully',
    type: PaymentDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  async createPayment(
    @Body() dto: CreatePaymentDto,
    @Req() req: Request,
  ): Promise<PaymentDto> {
    this.logger.log(`Creating payment for order: ${dto.orderId}`);
    return this.paymentsService.createPayment(dto, req.headers);
  }

  @Post(':id/process')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Process a payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment processed successfully',
    type: PaymentDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Payment not found',
  })
  async processPayment(
    @Param('id', ParseUUIDPipe) paymentId: string,
    @Body() dto: ProcessPaymentDto,
    @Req() req: Request,
  ): Promise<PaymentDto> {
    this.logger.log(`Processing payment with id: ${paymentId}`);
    return this.paymentsService.processPayment(paymentId, dto, req.headers);
  }

  @Post(':id/fail')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mark a payment as failed' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment marked as failed',
    type: PaymentDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Payment not found',
  })
  async failPayment(
    @Param('id', ParseUUIDPipe) paymentId: string,
    @Body('reason') reason?: string,
    @Req() req?: Request,
  ): Promise<PaymentDto> {
    this.logger.log(`Marking payment as failed: ${paymentId}`);
    return this.paymentsService.failPayment(paymentId, reason, req.headers);
  }

  @Get('order/:orderId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get payments for an order' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiResponse({
    status: 200,
    description: 'List of payments',
    type: [PaymentDto],
  })
  async getPaymentsByOrder(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Req() req: Request,
  ): Promise<PaymentDto[]> {
    this.logger.log(`Getting payments for order: ${orderId}`);
    return this.paymentsService.getPaymentsByOrder(orderId, req.headers);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment details',
    type: PaymentDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Payment not found',
  })
  async getPayment(
    @Param('id', ParseUUIDPipe) paymentId: string,
    @Req() req: Request,
  ): Promise<PaymentDto> {
    this.logger.log(`Getting payment with id: ${paymentId}`);
    return this.paymentsService.getPayment(paymentId, req.headers);
  }
}
