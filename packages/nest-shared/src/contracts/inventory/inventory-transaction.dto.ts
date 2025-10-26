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
} from 'class-validator';

export enum TransactionType {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  RETURN = 'RETURN',
  ADJUSTMENT = 'ADJUSTMENT',
  TRANSFER = 'TRANSFER',
}

export class InventoryTransactionDto {
  @ApiProperty({
    description: 'Transaction ID',
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
    description:
      'Transaction quantity (positive for additions, negative for subtractions)',
    example: 10,
  })
  @IsNumber()
  quantity: number;

  @ApiProperty({
    description: 'Transaction type',
    enum: TransactionType,
    example: TransactionType.PURCHASE,
  })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiPropertyOptional({
    description: 'Reference ID (e.g., order ID, purchase ID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  referenceId?: string;

  @ApiPropertyOptional({
    description: 'Reference type (e.g., "order", "purchase")',
    example: 'order',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  referenceType?: string;

  @ApiPropertyOptional({
    description: 'Transaction notes',
    example: 'Stock received from supplier ABC',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Transaction creation date',
    example: '2024-01-15T10:30:00Z',
  })
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'User who created the transaction',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  createdBy?: string;

  constructor(data: Partial<InventoryTransactionDto>) {
    Object.assign(this, data);
  }
}

export class CreateInventoryTransactionDto {
  @ApiProperty({
    description: 'Inventory item ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  inventoryItemId: string;

  @ApiProperty({
    description:
      'Transaction quantity (positive for additions, negative for subtractions)',
    example: 10,
  })
  @IsNumber()
  quantity: number;

  @ApiProperty({
    description: 'Transaction type',
    enum: TransactionType,
    example: TransactionType.PURCHASE,
  })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiPropertyOptional({
    description: 'Reference ID (e.g., order ID, purchase ID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  referenceId?: string;

  @ApiPropertyOptional({
    description: 'Reference type (e.g., "order", "purchase")',
    example: 'order',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  referenceType?: string;

  @ApiPropertyOptional({
    description: 'Transaction notes',
    example: 'Stock received from supplier ABC',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
