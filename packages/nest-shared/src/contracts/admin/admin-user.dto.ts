import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminUserDto {
  @ApiProperty({
    description: 'Unique identifier for the admin user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Username of the admin user',
    example: 'admin_user',
  })
  username: string;

  @ApiProperty({
    description: 'Email address of the admin user',
    example: 'admin@example.com',
  })
  email: string;

  @ApiPropertyOptional({
    description: 'First name of the admin user',
    example: 'John',
  })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last name of the admin user',
    example: 'Doe',
  })
  lastName?: string;

  @ApiProperty({
    description: 'Whether the user account is enabled',
    example: true,
  })
  enabled: boolean;

  @ApiProperty({
    description: 'Roles assigned to the admin user',
    example: ['admin', 'user-manager'],
    type: [String],
  })
  roles: string[];

  @ApiPropertyOptional({
    description: 'When the user was created',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdTimestamp?: number;

  @ApiPropertyOptional({
    description: 'Whether email is verified',
    example: true,
  })
  emailVerified?: boolean;
}

export class AdminUserPaginatedResponse {
  @ApiProperty({
    description: 'List of admin users',
    type: [AdminUserDto],
  })
  items: AdminUserDto[];

  @ApiProperty({
    description: 'Total number of admin users',
    example: 42,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;
}
