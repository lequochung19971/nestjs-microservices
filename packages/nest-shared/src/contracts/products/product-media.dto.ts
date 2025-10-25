import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class AttachMediaToProductDto {
  @ApiProperty({
    description: 'Media ID from media service to attach to product',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  mediaId: string;

  @ApiPropertyOptional({
    description: 'Set this media as the primary product image',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean = false;

  @ApiPropertyOptional({
    description: 'Alternative text for accessibility',
    example: 'MacBook Pro 16-inch in Space Gray',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  altText?: string;
}

export class ProductMediaResponseDto {
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

  // @ApiPropertyOptional({
  //   description: 'Image width in pixels',
  //   example: 1920,
  // })
  // @IsOptional()
  // width?: number;

  // @ApiPropertyOptional({
  //   description: 'Image height in pixels',
  //   example: 1080,
  // })
  // @IsOptional()
  // height?: number;

  constructor(data: Partial<ProductMediaResponseDto>) {
    Object.assign(this, data);
  }
}

export class DetachMediaFromProductResponseDto {
  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  productId: string;

  @ApiProperty({
    description: 'Detached media ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  mediaId: string;

  @ApiProperty({
    description: 'Operation success status',
    example: true,
  })
  success: boolean;

  constructor(productId: string, mediaId: string, success: boolean) {
    this.productId = productId;
    this.mediaId = mediaId;
    this.success = success;
  }
}

export class UpdatePrimaryImageDto {
  @ApiProperty({
    description: 'Media ID to set as primary image',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  mediaId: string;
}
