import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { Currency } from './product.dto';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product SKU (Stock Keeping Unit) - must be unique',
    example: 'LAPTOP-001',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  sku: string;

  @ApiProperty({
    description: 'Product name',
    example: 'MacBook Pro 16-inch',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'High-performance laptop with M2 chip and 16GB RAM',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Product price (must be positive)',
    example: '2499.99',
  })
  @IsDecimal({ decimal_digits: '2' })
  price: string;

  @ApiProperty({
    description: 'Product currency',
    enum: Currency,
    default: Currency.USD,
    example: Currency.USD,
  })
  @IsEnum(Currency)
  currency: Currency = Currency.USD;

  @ApiProperty({
    description: 'Product active status',
    default: true,
    example: true,
  })
  @IsBoolean()
  isActive: boolean = true;

  @ApiPropertyOptional({
    description: 'Array of category IDs to assign to this product',
    type: [String],
    example: ['123e4567-e89b-12d3-a456-426614174000'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @Type(() => String)
  categoryIds?: string[];

  @ApiPropertyOptional({
    description: 'Initial product variants to create',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Color' },
        value: { type: 'string', example: 'Space Gray' },
      },
    },
  })
  @IsOptional()
  @IsArray()
  variants?: Array<{
    name: string;
    value: string;
  }>;

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
