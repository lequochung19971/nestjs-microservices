import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentMethod, ShippingMethod } from './create-order.dto';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export class UpdateOrderDto {
  @ApiPropertyOptional({
    description: 'Order status',
    enum: OrderStatus,
  })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: 'Payment status',
    enum: PaymentStatus,
  })
  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({
    description: 'Payment method',
    enum: PaymentMethod,
  })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Shipping method',
    enum: ShippingMethod,
  })
  @IsEnum(ShippingMethod)
  @IsOptional()
  shippingMethod?: ShippingMethod;

  @ApiPropertyOptional({ description: 'Order notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}
