import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class RoleAssignmentDto {
  @ApiProperty({
    description: 'Roles to assign to the user',
    example: ['admin', 'user-manager'],
    type: [String],
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  roles: string[];
}

export class RoleDto {
  @ApiProperty({
    description: 'Role ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Role name',
    example: 'admin',
  })
  name: string;

  @ApiProperty({
    description: 'Role description',
    example: 'Administrator with full access',
  })
  description: string;

  @ApiProperty({
    description: 'Whether this is a composite role',
    example: false,
  })
  composite: boolean;
}

export class RolesListResponse {
  @ApiProperty({
    description: 'List of available roles',
    type: [RoleDto],
  })
  roles: RoleDto[];
}
