import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export enum ReservationStatus {
  ACTIVE = 'ACTIVE',
  FULFILLED = 'FULFILLED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export class InventoryReservationDto {
  @ApiProperty({
    description: 'Reservation ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Inventory item ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  inventoryItemId: string;

  @ApiProperty({
    description: 'Reserved quantity',
    example: 5,
  })
  @IsNumber()
  quantity: number;

  @ApiProperty({
    description: 'Order ID this reservation is for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  orderId: string;

  @ApiPropertyOptional({
    description: 'Reservation expiration date',
    example: '2024-01-22T10:30:00Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiresAt?: Date;

  @ApiProperty({
    description: 'Reservation status',
    enum: ReservationStatus,
    example: ReservationStatus.ACTIVE,
  })
  @IsEnum(ReservationStatus)
  status: ReservationStatus;

  @ApiProperty({
    description: 'Reservation creation date',
    example: '2024-01-15T10:30:00Z',
  })
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({
    description: 'Reservation last update date',
    example: '2024-01-15T10:30:00Z',
  })
  @IsDate()
  @Type(() => Date)
  updatedAt: Date;

  constructor(data: Partial<InventoryReservationDto>) {
    Object.assign(this, data);
  }
}

export class CreateInventoryReservationDto {
  @ApiProperty({
    description: 'Inventory item ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  inventoryItemId: string;

  @ApiProperty({
    description: 'Quantity to reserve',
    example: 5,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Order ID this reservation is for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  orderId: string;

  @ApiPropertyOptional({
    description: 'Reservation expiration date',
    example: '2024-01-22T10:30:00Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiresAt?: Date;
}

export class UpdateInventoryReservationDto {
  @ApiPropertyOptional({
    description: 'Quantity to reserve',
    example: 8,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({
    description: 'Reservation expiration date',
    example: '2024-01-25T10:30:00Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiresAt?: Date;
}

export class FulfillReservationDto {
  @ApiPropertyOptional({
    description: 'Notes about fulfillment',
    example: 'Order shipped successfully',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class CancelReservationDto {
  @ApiPropertyOptional({
    description: 'Reason for cancellation',
    example: 'Customer cancelled order',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
