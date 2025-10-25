import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDecimal,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { Currency } from './product.dto';

export class UpdateProductDto {
  @ApiPropertyOptional({
    description: 'Product SKU (Stock Keeping Unit) - must be unique',
    example: 'LAPTOP-001-V2',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string;

  @ApiPropertyOptional({
    description: 'Product name',
    example: 'MacBook Pro 16-inch (Updated)',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'High-performance laptop with M2 Pro chip and 32GB RAM',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Product price (must be positive)',
    example: '2999.99',
  })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  price?: string;

  @ApiPropertyOptional({
    description: 'Product currency',
    enum: Currency,
    example: Currency.EUR,
  })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @ApiPropertyOptional({
    description: 'Product active status',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description:
      'Array of category IDs to assign to this product (replaces existing categories)',
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
    description: 'Array of image IDs to assign to this product',
    type: [String],
    example: ['123e4567-e89b-12d3-a456-426614174000'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @Type(() => String)
  imageIds?: string[];
}
