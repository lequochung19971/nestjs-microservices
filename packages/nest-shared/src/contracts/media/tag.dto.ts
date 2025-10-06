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

export class CreateTagDto {
  @ApiProperty({ description: 'Tag name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Tag description' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateTagDto {
  @ApiPropertyOptional({ description: 'New tag name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'New tag description' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class TagQueryDto {
  @ApiPropertyOptional({ description: 'Search tags by name' })
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
    default: 50,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;
}

export class AddTagsToMediaDto {
  @ApiProperty({
    description: 'List of media IDs to tag',
    type: [String],
  })
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  mediaIds: string[];

  @ApiProperty({
    description: 'List of tag IDs to apply',
    type: [String],
  })
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  tagIds: string[];
}

export class TagResponseDto {
  @ApiProperty({ description: 'Tag ID' })
  id: string;

  @ApiProperty({ description: 'Tag name' })
  name: string;

  @ApiPropertyOptional({ description: 'Tag description' })
  description?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class PaginatedTagResponseDto {
  @ApiProperty({ type: [TagResponseDto], description: 'List of tags' })
  items: TagResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    example: {
      page: 1,
      limit: 50,
      total: 100,
      totalPages: 2,
    },
  })
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class DeleteTagResponseDto {
  @ApiProperty({ description: 'ID of the deleted tag' })
  id: string;

  @ApiProperty({ description: 'Whether the deletion was successful' })
  success: boolean;
}

export class TagOperationResponseDto {
  @ApiProperty({ description: 'Whether the operation was successful' })
  success: boolean;

  @ApiPropertyOptional({ description: 'Number of affected items' })
  count?: number;
}

export class RemoveTagsFromMediaDto {
  @ApiProperty({
    description: 'List of media IDs to remove tags from',
    type: [String],
  })
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  mediaIds: string[];

  @ApiProperty({
    description: 'List of tag IDs to remove',
    type: [String],
  })
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  tagIds: string[];
}
