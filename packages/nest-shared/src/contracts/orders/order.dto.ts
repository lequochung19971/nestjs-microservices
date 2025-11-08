import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus, PaymentStatus } from './update-order.dto';
import { PaymentMethod, ShippingMethod } from './create-order.dto';

export class OrderProductDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderId: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  sku: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  price: string;

  @ApiProperty()
  currency: string;
}

export class OrderItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderId: string;

  @ApiProperty()
  orderProductId: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unitPrice: string;

  @ApiProperty()
  totalPrice: string;

  @ApiProperty()
  discountAmount: string;

  @ApiProperty()
  taxAmount: string;

  @ApiPropertyOptional()
  inventoryReservationId?: string;

  @ApiPropertyOptional()
  product?: OrderProductDto;
}

export class ShippingAddressDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderId: string;

  @ApiProperty()
  fullName: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiProperty()
  addressLine1: string;

  @ApiPropertyOptional()
  addressLine2?: string;

  @ApiProperty()
  city: string;

  @ApiPropertyOptional()
  state?: string;

  @ApiProperty()
  postalCode: string;

  @ApiProperty()
  country: string;

  @ApiProperty()
  isDefault: boolean;
}

export class BillingAddressDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderId: string;

  @ApiProperty()
  fullName: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiProperty()
  addressLine1: string;

  @ApiPropertyOptional()
  addressLine2?: string;

  @ApiProperty()
  city: string;

  @ApiPropertyOptional()
  state?: string;

  @ApiProperty()
  postalCode: string;

  @ApiProperty()
  country: string;

  @ApiProperty()
  isDefault: boolean;
}

export class OrderStatusHistoryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderId: string;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiPropertyOptional()
  notes?: string;

  @ApiPropertyOptional()
  changedBy?: string;

  @ApiProperty()
  createdAt: Date;
}

export class PaymentDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderId: string;

  @ApiPropertyOptional()
  transactionId?: string;

  @ApiProperty()
  amount: string;

  @ApiProperty({ enum: PaymentStatus })
  status: PaymentStatus;

  @ApiProperty({ enum: PaymentMethod })
  method: PaymentMethod;

  @ApiPropertyOptional()
  metadata?: string;

  @ApiPropertyOptional()
  processedAt?: Date;

  @ApiProperty()
  createdAt: Date;
}

export class OrderDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderNumber: string;

  @ApiProperty()
  customerId: string;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty({ enum: PaymentStatus })
  paymentStatus: PaymentStatus;

  @ApiPropertyOptional({ enum: PaymentMethod })
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ enum: ShippingMethod })
  shippingMethod?: ShippingMethod;

  @ApiProperty()
  subtotal: string;

  @ApiProperty()
  taxAmount: string;

  @ApiProperty()
  shippingCost: string;

  @ApiProperty()
  discountAmount: string;

  @ApiProperty()
  totalAmount: string;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  confirmedAt?: Date;

  @ApiPropertyOptional()
  shippedAt?: Date;

  @ApiPropertyOptional()
  deliveredAt?: Date;

  @ApiPropertyOptional()
  cancelledAt?: Date;

  @ApiPropertyOptional({ type: [OrderItemDto] })
  items?: OrderItemDto[];

  @ApiPropertyOptional()
  shippingAddress?: ShippingAddressDto;

  @ApiPropertyOptional()
  billingAddress?: BillingAddressDto;

  @ApiPropertyOptional({ type: [OrderStatusHistoryDto] })
  statusHistory?: OrderStatusHistoryDto[];

  @ApiPropertyOptional({ type: [PaymentDto] })
  payments?: PaymentDto[];

  constructor(partial: Partial<OrderDto>) {
    Object.assign(this, partial);
  }
}
