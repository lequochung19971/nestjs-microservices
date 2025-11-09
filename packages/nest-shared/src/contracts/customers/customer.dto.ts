import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CustomerDto {
  @ApiProperty({ description: 'Customer ID' })
  id: string;

  @ApiProperty({ description: 'Username' })
  username: string;

  @ApiProperty({ description: 'Email address' })
  email: string;

  @ApiPropertyOptional({ description: 'First name' })
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name' })
  lastName?: string;

  @ApiProperty({ description: 'Whether the account is enabled' })
  enabled: boolean;

  @ApiProperty({ description: 'Whether the email is verified' })
  emailVerified: boolean;

  @ApiPropertyOptional({ description: 'Creation timestamp' })
  createdTimestamp?: number;
}
