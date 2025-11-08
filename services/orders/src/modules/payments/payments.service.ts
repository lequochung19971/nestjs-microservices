import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import {
  PaymentStatus,
  CreatePaymentDto,
  ProcessPaymentDto,
} from 'nest-shared/contracts';
import { PaymentProcessedEvent } from 'nest-shared/events';
import { DrizzleService } from '../../db/drizzle.service';
import { payments, orders } from '../../db/schema';
import { OrdersPublishers } from '../orders/orders-publishers';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly drizzle: DrizzleService,
    private readonly ordersPublishers: OrdersPublishers,
  ) {}

  async createPayment(dto: CreatePaymentDto): Promise<any> {
    try {
      // Verify order exists
      const order = await this.drizzle.client.query.orders.findFirst({
        where: eq(orders.id, dto.orderId),
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${dto.orderId} not found`);
      }

      const [payment] = await this.drizzle.client
        .insert(payments)
        .values({
          orderId: dto.orderId,
          amount: dto.amount,
          method: dto.method,
          status: 'PENDING',
          transactionId: dto.transactionId,
          metadata: dto.metadata,
        })
        .returning();

      this.logger.log(`Payment created for order ${dto.orderId}`);
      return payment;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to create payment: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to create payment: ${error.message}`,
      );
    }
  }

  async processPayment(
    paymentId: string,
    dto: ProcessPaymentDto,
  ): Promise<any> {
    try {
      const payment = await this.drizzle.client.query.payments.findFirst({
        where: eq(payments.id, paymentId),
      });

      if (!payment) {
        throw new NotFoundException(`Payment with ID ${paymentId} not found`);
      }

      const [updatedPayment] = await this.drizzle.client
        .update(payments)
        .set({
          status: 'PAID',
          transactionId: dto.transactionId,
          metadata: dto.metadata,
          processedAt: new Date(),
        })
        .where(eq(payments.id, paymentId))
        .returning();

      // Update order payment status
      await this.drizzle.client
        .update(orders)
        .set({
          paymentStatus: 'PAID',
          updatedAt: new Date(),
        })
        .where(eq(orders.id, payment.orderId));

      // Publish payment processed event
      await this.ordersPublishers.publishPaymentProcessed(
        new PaymentProcessedEvent({
          orderId: payment.orderId,
          paymentId: paymentId,
          amount: payment.amount,
          status: PaymentStatus.PAID,
          transactionId: dto.transactionId,
        }),
      );

      this.logger.log(`Payment ${paymentId} processed successfully`);
      return updatedPayment;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to process payment: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to process payment: ${error.message}`,
      );
    }
  }

  async failPayment(paymentId: string, reason?: string): Promise<any> {
    try {
      const payment = await this.drizzle.client.query.payments.findFirst({
        where: eq(payments.id, paymentId),
      });

      if (!payment) {
        throw new NotFoundException(`Payment with ID ${paymentId} not found`);
      }

      const [updatedPayment] = await this.drizzle.client
        .update(payments)
        .set({
          status: 'FAILED',
          metadata: reason || payment.metadata,
          processedAt: new Date(),
        })
        .where(eq(payments.id, paymentId))
        .returning();

      // Update order payment status
      await this.drizzle.client
        .update(orders)
        .set({
          paymentStatus: 'FAILED',
          updatedAt: new Date(),
        })
        .where(eq(orders.id, payment.orderId));

      // Publish payment processed event
      await this.ordersPublishers.publishPaymentProcessed(
        new PaymentProcessedEvent({
          orderId: payment.orderId,
          paymentId,
          amount: payment.amount,
          status: PaymentStatus.FAILED,
        }),
      );

      this.logger.log(`Payment ${paymentId} marked as failed`);
      return updatedPayment;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to fail payment: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to update payment: ${error.message}`,
      );
    }
  }

  async getPaymentsByOrder(orderId: string): Promise<any[]> {
    try {
      const orderPayments = await this.drizzle.client.query.payments.findMany({
        where: eq(payments.orderId, orderId),
      });

      return orderPayments;
    } catch (error) {
      this.logger.error(
        `Failed to get payments for order ${orderId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Failed to get payments: ${error.message}`);
    }
  }

  async getPayment(paymentId: string): Promise<any> {
    try {
      const payment = await this.drizzle.client.query.payments.findFirst({
        where: eq(payments.id, paymentId),
      });

      if (!payment) {
        throw new NotFoundException(`Payment with ID ${paymentId} not found`);
      }

      return payment;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to get payment ${paymentId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Failed to get payment: ${error.message}`);
    }
  }
}
