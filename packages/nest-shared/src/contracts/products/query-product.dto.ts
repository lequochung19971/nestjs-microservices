import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { BaseQueryRequest, SortOrder } from '../shared/base-query-request.dto';
import { Currency, ProductDto } from './product.dto';

export enum ProductSortField {
  NAME = 'name',
  PRICE = 'price',
  SKU = 'sku',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export class QueryProductRequest extends BaseQueryRequest {
  @ApiPropertyOptional({
    description: 'Search term for product name or description',
    example: 'MacBook Pro',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by category ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Filter by multiple category IDs',
    type: [String],
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '987fcdeb-51a2-43d1-b789-fedcba098765',
    ],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @Type(() => String)
  categoryIds?: string[];

  @ApiPropertyOptional({
    description: 'Filter by currency',
    enum: Currency,
    example: Currency.USD,
  })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @ApiPropertyOptional({
    description: 'Minimum price filter',
    example: 100.0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Maximum price filter',
    example: 5000.0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: ProductSortField,
    default: ProductSortField.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(ProductSortField)
  sortField?: ProductSortField = ProductSortField.CREATED_AT;

  @ApiPropertyOptional({
    description: 'Sort order (asc or desc)',
    enum: SortOrder,
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Include product variants in response',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeVariants?: boolean = false;

  @ApiPropertyOptional({
    description: 'Include product media/images in response',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeMedia?: boolean = false;

  @ApiPropertyOptional({
    description: 'Include product categories in response',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeCategories?: boolean = false;
}

export class QueryProductResponse {
  @ApiPropertyOptional({
    description: 'Array of products',
    type: [ProductDto],
  })
  items: ProductDto[];

  @ApiPropertyOptional({
    description: 'Pagination metadata',
    type: 'object',
    properties: {
      page: { type: 'number', example: 1 },
      limit: { type: 'number', example: 20 },
      total: { type: 'number', example: 150 },
      totalPages: { type: 'number', example: 8 },
    },
  })
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  constructor(items: ProductDto[], meta: QueryProductResponse['meta']) {
    this.items = items;
    this.meta = meta;
  }
}
