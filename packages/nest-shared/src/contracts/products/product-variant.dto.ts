import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateProductVariantDto {
  @ApiProperty({
    description: 'Variant name (e.g., Color, Size, Material)',
    example: 'Color',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Variant value (e.g., Red, Large, Cotton)',
    example: 'Space Gray',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  value: string;
}

export class UpdateProductVariantDto {
  @ApiPropertyOptional({
    description: 'Variant name (e.g., Color, Size, Material)',
    example: 'Color',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Variant value (e.g., Red, Large, Cotton)',
    example: 'Silver',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  value?: string;
}

export class ProductVariantResponseDto {
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
    description: 'Variant name',
    example: 'Color',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Variant value',
    example: 'Space Gray',
  })
  @IsString()
  value: string;

  constructor(data: Partial<ProductVariantResponseDto>) {
    Object.assign(this, data);
  }
}

export class DeleteProductVariantResponseDto {
  @ApiProperty({
    description: 'Deleted variant ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Operation success status',
    example: true,
  })
  success: boolean;

  constructor(id: string, success: boolean) {
    this.id = id;
    this.success = success;
  }
}
