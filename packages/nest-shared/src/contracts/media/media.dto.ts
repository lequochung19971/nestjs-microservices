import {
  ApiProperty,
  ApiPropertyOptional,
  getSchemaPath,
} from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsArray,
  IsString,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

import { FolderResponseDto } from './folder.dto';
import { MediaVariantResponseDto } from './variant.dto';

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  DOCUMENT = 'DOCUMENT',
}

export enum MediaStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum StorageProvider {
  LOCAL = 'LOCAL',
  S3 = 'S3',
  CLOUDINARY = 'CLOUDINARY',
  AZURE = 'AZURE',
}

export class CreateMediaDto {
  @ApiProperty({ description: 'The uploaded file' })
  file: Express.Multer.File;

  @ApiProperty({ description: 'ID of the media owner' })
  @IsUUID()
  ownerId: string;

  @ApiPropertyOptional({
    description: 'Whether the media is publicly accessible',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiPropertyOptional({
    description: 'Additional metadata for the media',
    type: 'object',
    additionalProperties: true,
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Path where the media is stored',
    default: '',
  })
  @IsString()
  @IsOptional()
  path?: string;

  @ApiPropertyOptional({
    description: 'Folder ID where the media is stored',
  })
  @IsString()
  @IsOptional()
  folderId?: string;
}

export class MediaQueryDto {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    default: 1,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: 20,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Filter by media type',
    enum: MediaType,
    enumName: 'MediaType',
  })
  @IsEnum(MediaType)
  @IsOptional()
  type?: MediaType;

  @ApiPropertyOptional({
    description: 'Search by filename',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by tags',
    type: [String],
  })
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Filter by folder ID',
  })
  @IsUUID()
  @IsOptional()
  folderId?: string;

  @ApiPropertyOptional({
    description: 'Filter by owner ID',
  })
  @IsUUID()
  @IsOptional()
  ownerId?: string;
}

export class UpdateMediaDto {
  @ApiPropertyOptional({
    description: 'Whether the media is publicly accessible',
  })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiPropertyOptional({
    description: 'Additional metadata for the media',
    type: 'object',
    additionalProperties: true,
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Path where the media is stored',
  })
  @IsString()
  @IsOptional()
  path?: string;

  @ApiPropertyOptional({
    description: 'Original filename of the media',
  })
  @IsString()
  @IsOptional()
  originalFilename?: string;

  @ApiPropertyOptional({
    description: 'MIME type of the media file',
  })
  @IsString()
  @IsOptional()
  mimeType?: string;

  @ApiPropertyOptional({
    description: 'Media type category',
    enum: ['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT'],
    enumName: 'MediaType',
  })
  @IsString()
  @IsOptional()
  @IsEnum(MediaType)
  type?: MediaType;

  @ApiPropertyOptional({
    description: 'Status of the media processing',
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
    enumName: 'MediaStatus',
  })
  @IsString()
  @IsOptional()
  @IsEnum(MediaStatus)
  status?: MediaStatus;

  @ApiPropertyOptional({
    description: 'Storage provider for the media',
    enum: ['LOCAL', 'S3', 'CLOUDINARY', 'AZURE'],
    enumName: 'StorageProvider',
  })
  @IsString()
  @IsOptional()
  @IsEnum(StorageProvider)
  provider?: StorageProvider;

  @ApiPropertyOptional({
    description: 'URL to access the media',
  })
  @IsString()
  @IsOptional()
  url?: string;
}

export class FileUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary' as const,
    description: 'Media file to upload',
  })
  file: MulterFile;

  @ApiPropertyOptional({
    type: 'boolean',
    description: 'Whether the file is publicly accessible',
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isPublic?: boolean;

  @ApiPropertyOptional({
    type: 'string',
    description: 'Path where the file should be stored',
  })
  @IsString()
  @Type(() => String)
  path?: string;

  @ApiPropertyOptional({
    type: 'object',
    description: 'Additional metadata for the file',
    additionalProperties: true,
  })
  @IsObject()
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    type: 'string',
    description: 'Folder ID where the file should be stored',
  })
  @IsString()
  @IsOptional()
  @Type(() => String)
  folderId?: string;
}

export class BatchFileUploadDto {
  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' as const },
    description: 'Media files to upload',
  })
  files: MulterFile[];

  @ApiPropertyOptional({
    type: 'boolean',
    description: 'Whether the files are publicly accessible',
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isPublic?: boolean;

  @ApiPropertyOptional({
    type: 'string',
    description: 'Path where the files should be stored',
  })
  @IsString()
  @IsOptional()
  @Type(() => String)
  path?: string;

  @ApiPropertyOptional({
    type: 'object',
    description: 'Additional metadata for the files',
    additionalProperties: true,
  })
  @IsObject()
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    type: 'string',
    description: 'Folder ID where the files should be stored',
  })
  @IsString()
  @IsOptional()
  @Type(() => String)
  folderId?: string;
}

export class MediaResponseDto {
  @ApiProperty({ description: 'Media ID' })
  id: string;

  @ApiProperty({ description: 'Filename in storage' })
  filename: string;

  @ApiProperty({ description: 'Original uploaded filename' })
  originalFilename: string;

  @ApiProperty({ description: 'MIME type of the file' })
  mimeType: string;

  @ApiProperty({ description: 'Size of the file in bytes' })
  size: number;

  @ApiProperty({
    enum: ['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT'],
    enumName: 'MediaType',
    description: 'Type of media',
  })
  type: MediaType;

  @ApiProperty({ description: 'Storage provider' })
  provider: string;

  @ApiPropertyOptional({ description: 'Path in storage' })
  path?: string;

  @ApiProperty({ description: 'URL to access the media' })
  url: string;

  @ApiProperty({ description: 'Media processing status' })
  status: string;

  @ApiProperty({ description: 'ID of the media owner' })
  ownerId: string;

  @ApiProperty({ description: 'Whether the media is publicly accessible' })
  isPublic: boolean;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    type: 'object',
    additionalProperties: true,
  })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Media variants',
    type: [MediaVariantResponseDto],
  })
  variants?: MediaVariantResponseDto[];
  folder?: FolderResponseDto;
}

export class PaginatedMediaResponseDto {
  @ApiProperty({ type: [MediaResponseDto], description: 'List of media items' })
  items: MediaResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    example: {
      page: 1,
      limit: 20,
      total: 100,
      totalPages: 5,
    },
  })
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class DeleteMediaResponseDto {
  @ApiProperty({ description: 'ID of the deleted media' })
  id: string;

  @ApiProperty({ description: 'Whether the deletion was successful' })
  success: boolean;
}

export class GetMediaByIdsDto {
  @ApiProperty({ description: 'Media IDs' })
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}

export type MulterFile = Express.Multer.File;
