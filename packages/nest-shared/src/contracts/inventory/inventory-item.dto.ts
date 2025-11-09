import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export enum InventoryStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  SOLD = 'SOLD',
  DAMAGED = 'DAMAGED',
  RETURNED = 'RETURNED',
}

export class InventoryItemProductDto {
  @ApiProperty({
    description: 'Inventory product entry ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Product ID from the catalog service',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  productId: string;

  @ApiProperty({
    description: 'Product SKU',
    example: 'SKU-12345',
  })
  @IsString()
  sku: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Wireless Headphones',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Whether the product is active in the catalog',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;

  @ApiPropertyOptional({
    description: 'Primary media URL for the product',
    example: 'https://cdn.example.com/products/headphones.jpg',
  })
  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @ApiProperty({
    description: 'Last time the product data was synchronized',
    example: '2024-01-15T10:30:00Z',
  })
  @IsDate()
  @Type(() => Date)
  lastUpdated: Date;

  constructor(data: Partial<InventoryItemProductDto>) {
    Object.assign(this, data);
  }
}

export class InventoryItemDto {
  @ApiProperty({
    description: 'Inventory item ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Warehouse ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  warehouseId: string;

  @ApiProperty({
    description: 'Current quantity in stock',
    example: 100,
  })
  @IsNumber()
  quantity: number;

  @ApiProperty({
    description: 'Reserved quantity',
    example: 10,
  })
  @IsNumber()
  reservedQuantity: number;

  @ApiProperty({
    description: 'Inventory status',
    enum: InventoryStatus,
    example: InventoryStatus.AVAILABLE,
  })
  @IsEnum(InventoryStatus)
  status: InventoryStatus;

  @ApiPropertyOptional({
    description: 'Reorder point - when to trigger reorder',
    example: 20,
  })
  @IsOptional()
  @IsNumber()
  reorderPoint?: number;

  @ApiPropertyOptional({
    description: 'Reorder quantity - how much to order',
    example: 50,
  })
  @IsOptional()
  @IsNumber()
  reorderQuantity?: number;

  @ApiPropertyOptional({
    description: 'Reference to the inventory product entry',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  inventoryProductId?: string;

  @ApiPropertyOptional({
    description: 'Product details linked to this inventory item',
    type: () => InventoryItemProductDto,
  })
  @IsOptional()
  @Type(() => InventoryItemProductDto)
  product?: InventoryItemProductDto | null;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-15T10:30:00Z',
  })
  @IsDate()
  @Type(() => Date)
  updatedAt: Date;

  constructor(data: Partial<InventoryItemDto>) {
    Object.assign(this, data);
  }
}

export class CreateInventoryItemDto {
  @ApiProperty({
    description: 'Warehouse ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  warehouseId: string;

  @ApiProperty({
    description: 'Initial quantity',
    example: 100,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiPropertyOptional({
    description: 'Inventory status',
    enum: InventoryStatus,
    default: InventoryStatus.AVAILABLE,
    example: InventoryStatus.AVAILABLE,
  })
  @IsOptional()
  @IsEnum(InventoryStatus)
  status?: InventoryStatus = InventoryStatus.AVAILABLE;

  @ApiPropertyOptional({
    description: 'Reorder point - when to trigger reorder',
    example: 20,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  reorderPoint?: number;

  @ApiPropertyOptional({
    description: 'Reorder quantity - how much to order',
    example: 50,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  reorderQuantity?: number;
}

export class UpdateInventoryItemDto {
  @ApiPropertyOptional({
    description: 'New quantity',
    example: 150,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional({
    description: 'Inventory status',
    enum: InventoryStatus,
    example: InventoryStatus.RESERVED,
  })
  @IsOptional()
  @IsEnum(InventoryStatus)
  status?: InventoryStatus;

  @ApiPropertyOptional({
    description: 'Reorder point - when to trigger reorder',
    example: 25,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  reorderPoint?: number;

  @ApiPropertyOptional({
    description: 'Reorder quantity - how much to order',
    example: 75,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  reorderQuantity?: number;

  @ApiPropertyOptional({
    description: 'Warehouse ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  warehouseId?: string;
}

export class AdjustQuantityDto {
  @ApiProperty({
    description: 'Quantity adjustment (positive to add, negative to subtract)',
    example: 10,
  })
  @IsNumber()
  quantity: number;

  @ApiPropertyOptional({
    description: 'Notes about the adjustment',
    example: 'Stock received from supplier',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
