import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: 'uuid-string'
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com'
  })
  email: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John'
  })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe'
  })
  lastName: string;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2024-01-01T00:00:00.000Z'
  })
  createdAt: Date;
}
