import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { InventoryStatus } from './inventory-item.dto';
import { ReservationStatus } from './inventory-reservation.dto';
import { TransactionType } from './inventory-transaction.dto';

class BaseQueryRequest {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortField?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class QueryWarehouseRequest extends BaseQueryRequest {
  @ApiPropertyOptional({
    description: 'Search term for warehouse name or address',
    example: 'main',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean = true;
}

export class QueryInventoryItemRequest extends BaseQueryRequest {
  @ApiPropertyOptional({
    description: 'Filter by warehouse ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  warehouseId?: string;

  @ApiPropertyOptional({
    description: 'Filter by product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({
    description: 'Filter by inventory status',
    enum: InventoryStatus,
    example: InventoryStatus.AVAILABLE,
  })
  @IsOptional()
  @IsEnum(InventoryStatus)
  status?: InventoryStatus;

  @ApiPropertyOptional({
    description: 'Filter by low stock (below reorder point)',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  lowStock?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by out of stock',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  outOfStock?: boolean;
}

export class QueryInventoryTransactionRequest extends BaseQueryRequest {
  @ApiPropertyOptional({
    description: 'Filter by inventory item ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  inventoryItemId?: string;

  @ApiPropertyOptional({
    description: 'Filter by transaction type',
    enum: TransactionType,
    example: TransactionType.PURCHASE,
  })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiPropertyOptional({
    description: 'Filter by reference ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  referenceId?: string;

  @ApiPropertyOptional({
    description: 'Filter by reference type',
    example: 'order',
  })
  @IsOptional()
  @IsString()
  referenceType?: string;

  @ApiPropertyOptional({
    description: 'Filter by date range - start date',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'Filter by date range - end date',
    example: '2024-01-31T23:59:59Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;
}

export class QueryInventoryReservationRequest extends BaseQueryRequest {
  @ApiPropertyOptional({
    description: 'Filter by inventory item ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  inventoryItemId?: string;

  @ApiPropertyOptional({
    description: 'Filter by order ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  orderId?: string;

  @ApiPropertyOptional({
    description: 'Filter by reservation status',
    enum: ReservationStatus,
    example: ReservationStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;

  @ApiPropertyOptional({
    description: 'Filter by expired reservations',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  expired?: boolean;
}

export class QueryResponse<T> {
  @ApiProperty({
    description: 'Array of items',
    type: 'array',
  })
  items: T[];

  @ApiProperty({
    description: 'Pagination metadata',
  })
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  constructor(
    items: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    },
  ) {
    this.items = items;
    this.pagination = pagination;
  }
}
