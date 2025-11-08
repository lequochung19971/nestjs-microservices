import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PAYPAL = 'PAYPAL',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
}

export enum ShippingMethod {
  STANDARD = 'STANDARD',
  EXPRESS = 'EXPRESS',
  OVERNIGHT = 'OVERNIGHT',
  PICKUP = 'PICKUP',
}

export class CreateOrderItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'Quantity' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: 'Unit price override' })
  @IsNumber()
  @IsOptional()
  unitPrice?: number;
}

export class CreateShippingAddressDto {
  @ApiProperty({ description: 'Full name' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Address line 1' })
  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @ApiPropertyOptional({ description: 'Address line 2' })
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiPropertyOptional({ description: 'State/Province' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({ description: 'Postal code' })
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @ApiProperty({ description: 'Country' })
  @IsString()
  @IsNotEmpty()
  country: string;
}

export class CreateBillingAddressDto {
  @ApiProperty({ description: 'Full name' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Address line 1' })
  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @ApiPropertyOptional({ description: 'Address line 2' })
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiPropertyOptional({ description: 'State/Province' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({ description: 'Postal code' })
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @ApiProperty({ description: 'Country' })
  @IsString()
  @IsNotEmpty()
  country: string;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsUUID()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({ description: 'Order items', type: [CreateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ApiProperty({ description: 'Shipping address' })
  @ValidateNested()
  @Type(() => CreateShippingAddressDto)
  shippingAddress: CreateShippingAddressDto;

  @ApiPropertyOptional({ description: 'Billing address' })
  @ValidateNested()
  @Type(() => CreateBillingAddressDto)
  @IsOptional()
  billingAddress?: CreateBillingAddressDto;

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
