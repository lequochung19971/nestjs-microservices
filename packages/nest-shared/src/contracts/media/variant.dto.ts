import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export enum FitType {
  COVER = 'cover',
  CONTAIN = 'contain',
  FILL = 'fill',
  INSIDE = 'inside',
  OUTSIDE = 'outside',
}

export class VariantConfigDto {
  @ApiProperty({ description: 'Name of the variant' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Width of the variant in pixels' })
  @IsInt()
  @IsOptional()
  width?: number;

  @ApiPropertyOptional({ description: 'Height of the variant in pixels' })
  @IsInt()
  @IsOptional()
  height?: number;

  @ApiPropertyOptional({
    description: 'Resize fit strategy',
    enum: FitType,
    default: FitType.COVER,
  })
  @IsEnum(FitType)
  @IsOptional()
  fit?: FitType;

  @ApiPropertyOptional({
    description: 'Quality of the image (1-100)',
    default: 80,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  quality?: number;
}

export class GenerateVariantsOptionsDto {
  @ApiProperty({ description: 'Media ID to generate variants for' })
  @IsUUID()
  mediaId: string;

  @ApiProperty({ description: 'File buffer to process' })
  file: Buffer;

  @ApiProperty({ description: 'MIME type of the file' })
  @IsString()
  mimeType: string;

  @ApiPropertyOptional({ description: 'Path where variants will be stored' })
  @IsString()
  @IsOptional()
  path?: string;

  @ApiPropertyOptional({
    description: 'Variant configurations',
    type: [VariantConfigDto],
  })
  @IsOptional()
  configs?: VariantConfigDto[];
}

export class MediaVariantResponseDto {
  @ApiProperty({ description: 'Variant ID' })
  id: string;

  @ApiProperty({ description: 'Media ID this variant belongs to' })
  mediaId: string;

  @ApiProperty({ description: 'Variant name' })
  name: string;

  @ApiProperty({ description: 'Storage path' })
  path: string;

  @ApiProperty({ description: 'URL to access the variant' })
  url: string;

  @ApiPropertyOptional({ description: 'Width of the variant in pixels' })
  width?: number;

  @ApiPropertyOptional({ description: 'Height of the variant in pixels' })
  height?: number;

  @ApiProperty({ description: 'Size of the variant file in bytes' })
  size: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class DeleteVariantResponseDto {
  @ApiProperty({ description: 'ID of the deleted variant' })
  id: string;

  @ApiProperty({ description: 'Whether the deletion was successful' })
  success: boolean;
}

export class DeleteAllVariantsResponseDto {
  @ApiProperty({ description: 'Number of variants deleted' })
  count: number;

  @ApiProperty({ description: 'Whether the deletion was successful' })
  success: boolean;
}

export class MediaVariantDto {
  @ApiProperty({ description: 'Media ID this variant belongs to' })
  @IsUUID()
  @IsNotEmpty()
  mediaId: string;

  @ApiProperty({
    description: 'Variant name (e.g., thumbnail, small, medium, large)',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Storage path' })
  @IsString()
  @IsNotEmpty()
  path: string;

  @ApiProperty({ description: 'URL to access the variant' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({ description: 'Width of the variant in pixels' })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  width?: number;

  @ApiPropertyOptional({ description: 'Height of the variant in pixels' })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  height?: number;

  @ApiProperty({ description: 'Size of the variant file in bytes' })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  size: number;
}

export class UpdateMediaVariantDto {
  @ApiPropertyOptional({ description: 'Variant name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Storage path' })
  @IsString()
  @IsOptional()
  path?: string;

  @ApiPropertyOptional({ description: 'URL to access the variant' })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiPropertyOptional({ description: 'Width of the variant in pixels' })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  width?: number;

  @ApiPropertyOptional({ description: 'Height of the variant in pixels' })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  height?: number;

  @ApiPropertyOptional({ description: 'Size of the variant file in bytes' })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  size?: number;
}
