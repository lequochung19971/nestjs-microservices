import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { BaseQueryRequest, BaseQueryResponse, PaginationMeta } from '../shared';
import { OrderDto } from './order.dto';
import { OrderStatus, PaymentStatus } from './update-order.dto';

export class QueryOrderRequestDto extends BaseQueryRequest {
  @ApiPropertyOptional({ description: 'Filter by customer ID' })
  @IsUUID()
  @IsOptional()
  customerId?: string;

  @ApiPropertyOptional({
    description: 'Filter by order status',
    enum: OrderStatus,
  })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: 'Filter by payment status',
    enum: PaymentStatus,
  })
  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({ description: 'Include order items' })
  @Type(() => Boolean)
  @IsOptional()
  includeItems?: boolean;

  @ApiPropertyOptional({ description: 'Include shipping address' })
  @Type(() => Boolean)
  @IsOptional()
  includeShippingAddress?: boolean;

  @ApiPropertyOptional({ description: 'Include billing address' })
  @Type(() => Boolean)
  @IsOptional()
  includeBillingAddress?: boolean;

  @ApiPropertyOptional({ description: 'Include status history' })
  @Type(() => Boolean)
  @IsOptional()
  includeStatusHistory?: boolean;

  @ApiPropertyOptional({ description: 'Include payments' })
  @Type(() => Boolean)
  @IsOptional()
  includePayments?: boolean;
}

export class QueryOrderResponseDto extends BaseQueryResponse<OrderDto> {
  @ApiPropertyOptional({ type: [OrderDto] })
  data: OrderDto[];
}
