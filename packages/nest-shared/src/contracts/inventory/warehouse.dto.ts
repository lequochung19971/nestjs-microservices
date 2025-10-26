import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
export class WarehouseDto {
  @ApiProperty({
    description: 'Warehouse ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Warehouse name',
    example: 'Main Warehouse',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Warehouse address',
    example: '123 Main St, City, State 12345',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'Whether the warehouse is active',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: 'Warehouse creation date',
    example: '2024-01-15T10:30:00Z',
  })
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({
    description: 'Warehouse last update date',
    example: '2024-01-15T10:30:00Z',
  })
  @IsDate()
  @Type(() => Date)
  updatedAt: Date;

  constructor(data: Partial<WarehouseDto>) {
    Object.assign(this, data);
  }
}

export class CreateWarehouseDto {
  @ApiProperty({
    description: 'Warehouse name',
    example: 'Main Warehouse',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Warehouse address',
    example: '123 Main St, City, State 12345',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Whether the warehouse is active',
    default: true,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

export class UpdateWarehouseDto {
  @ApiPropertyOptional({
    description: 'Warehouse name',
    example: 'Updated Warehouse Name',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'Warehouse address',
    example: '456 Updated St, City, State 12345',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Whether the warehouse is active',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
