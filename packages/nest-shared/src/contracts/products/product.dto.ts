import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsDecimal,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { CategoryDto } from '../categories/category.dto';
import { MediaType } from '../media/media.dto';

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  JPY = 'JPY',
  CAD = 'CAD',
  AUD = 'AUD',
}

export class ProductVariantDto {
  @ApiProperty({
    description: 'Variant ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Product ID this variant belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  productId: string;

  @ApiProperty({
    description: 'Variant name (e.g., Color, Size, Material)',
    example: 'Color',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Variant value (e.g., Red, Large, Cotton)',
    example: 'Red',
  })
  @IsString()
  value: string;
}

export class ProductMediaDto {
  @ApiProperty({
    description: 'Product media ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Product ID this media belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  productId: string;

  @ApiProperty({
    description: 'Media URL',
    example: 'https://example.com/images/product-123.jpg',
  })
  @IsString()
  url: string;

  @ApiProperty({
    description: 'Media ID from media service',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  mediaId: string;

  @ApiProperty({
    description: 'Original filename',
    example: 'product-image.jpg',
  })
  @IsString()
  originalFilename: string;

  @ApiProperty({
    description: 'MIME type',
    example: 'image/jpeg',
  })
  @IsString()
  mimeType: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024000,
  })
  size: number;

  @ApiProperty({
    description: 'Media type',
    example: 'IMAGE',
  })
  @IsString()
  type: string;

  @ApiPropertyOptional({
    description: 'Image width in pixels',
    example: 1920,
  })
  @IsOptional()
  width?: number;

  @ApiPropertyOptional({
    description: 'Image height in pixels',
    example: 1080,
  })
  @IsOptional()
  height?: number;
}

export class ProductDto {
  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Product SKU (Stock Keeping Unit)',
    example: 'LAPTOP-001',
  })
  @IsString()
  sku: string;

  @ApiProperty({
    description: 'Product name',
    example: 'MacBook Pro 16-inch',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'High-performance laptop with M2 chip',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Product price',
    example: '2499.99',
  })
  @IsDecimal({ decimal_digits: '2' })
  price: string;

  @ApiProperty({
    description: 'Product currency',
    enum: Currency,
    example: Currency.USD,
  })
  @IsEnum(Currency)
  currency: Currency;

  @ApiProperty({
    description: 'Product active status',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: 'Product creation date',
    example: '2024-01-15T10:30:00Z',
  })
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({
    description: 'Product last update date',
    example: '2024-01-15T10:30:00Z',
  })
  @IsDate()
  @Type(() => Date)
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Product categories',
    type: [CategoryDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryDto)
  categories?: CategoryDto[];

  @ApiPropertyOptional({
    description: 'Product variants',
    type: [ProductVariantDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants?: ProductVariantDto[];

  @ApiPropertyOptional({
    description: 'Product media/images',
    type: [ProductMediaDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductMediaDto)
  images?: ProductMediaDto[];

  constructor(data: Partial<ProductDto>) {
    Object.assign(this, data);
  }
}

export class UpdateProductMediaDto {
  @ApiProperty({
    description: 'Product media ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Original filename',
    example: 'product-image.jpg',
  })
  @IsString()
  originalFilename: string;

  @ApiProperty({
    description: 'MIME type',
    example: 'image/jpeg',
  })
  @IsString()
  mimeType: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024000,
  })
  @IsNumber()
  size: number;

  @ApiProperty({
    description: 'Media type',
    example: 'IMAGE',
  })
  @IsString()
  @IsEnum(MediaType)
  type: MediaType;

  @ApiProperty({
    description: 'URL',
    example: 'https://example.com/images/product-123.jpg',
  })
  @IsString()
  @IsUrl()
  url: string;
}
