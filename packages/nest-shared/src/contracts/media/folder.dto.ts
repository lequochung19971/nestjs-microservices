import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateFolderDto {
  @ApiProperty({ description: 'Name of the folder' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'ID of the parent folder' })
  @IsUUID()
  @IsOptional()
  parentId?: string;

  @ApiProperty({ description: 'ID of the folder owner' })
  @IsUUID()
  ownerId: string;
}

export class UpdateFolderDto {
  @ApiPropertyOptional({ description: 'New name for the folder' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'New parent folder ID (null for root folder)',
    nullable: true,
  })
  @IsUUID()
  @IsOptional()
  parentId?: string | null;
}

export class FolderQueryDto {
  @ApiPropertyOptional({ description: 'ID of the parent folder' })
  @IsUUID()
  @IsOptional()
  parentId?: string;

  @ApiPropertyOptional({ description: 'Search folders by name' })
  @IsString()
  @IsOptional()
  search?: string;

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

  @ApiPropertyOptional({ description: 'ID of the folder owner' })
  @IsUUID()
  @IsOptional()
  ownerId?: string;
}

export class MoveMediaToFolderDto {
  @ApiProperty({
    description: 'List of media IDs to move',
    type: [String],
  })
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  mediaIds: string[];

  @ApiProperty({ description: 'Target folder ID' })
  @IsUUID()
  folderId: string;
}

export class FolderResponseDto {
  @ApiProperty({ description: 'Folder ID' })
  id: string;

  @ApiProperty({ description: 'Folder name' })
  name: string;

  @ApiPropertyOptional({
    description: 'Parent folder ID',
    nullable: true,
  })
  parentId: string | null;

  @ApiProperty({ description: 'ID of the folder owner' })
  ownerId: string;

  @ApiProperty({ description: 'Full path of the folder' })
  path: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Parent folder details',
    type: FolderResponseDto,
    additionalProperties: true,
    nullable: true,
  })
  parent?: FolderResponseDto;

  @ApiPropertyOptional({
    description: 'Child folders',
    type: [FolderResponseDto],
  })
  children?: FolderResponseDto[];
}

export class PaginatedFolderResponseDto {
  @ApiProperty({ type: [FolderResponseDto], description: 'List of folders' })
  items: FolderResponseDto[];

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

export class DeleteFolderResponseDto {
  @ApiProperty({ description: 'ID of the deleted folder' })
  id: string;

  @ApiProperty({ description: 'Whether the deletion was successful' })
  success: boolean;
}

export class MoveMediaResponseDto {
  @ApiProperty({ description: 'Whether the move operation was successful' })
  success: boolean;

  @ApiProperty({ description: 'Number of media items moved' })
  count: number;
}
