import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PaymentMethod } from './create-order.dto';

export class CreatePaymentDto {
  @ApiProperty({ description: 'Order ID' })
  @IsUUID()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ description: 'Payment amount' })
  @IsString()
  @IsNotEmpty()
  amount: string;

  @ApiProperty({ description: 'Payment method', enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  method: PaymentMethod;

  @ApiPropertyOptional({ description: 'Transaction ID from payment provider' })
  @IsString()
  @IsOptional()
  transactionId?: string;

  @ApiPropertyOptional({ description: 'Additional payment metadata' })
  @IsString()
  @IsOptional()
  metadata?: string;
}

export class ProcessPaymentDto {
  @ApiProperty({ description: 'Transaction ID from payment provider' })
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @ApiPropertyOptional({ description: 'Additional payment metadata' })
  @IsString()
  @IsOptional()
  metadata?: string;
}
