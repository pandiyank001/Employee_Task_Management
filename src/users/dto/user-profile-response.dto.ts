import { ApiProperty } from '@nestjs/swagger';

export class UserProfileResponseDto {
  @ApiProperty({
    example: 'uuid-string'
  })
  id: string;

  @ApiProperty({
    example: 'user@example.com'
  })
  email: string;

  @ApiProperty({
    example: 'John'
  })
  firstName: string;

  @ApiProperty({
    example: 'Doe'
  })
  lastName: string;

  @ApiProperty({
    example: true
  })
  isActive: boolean;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z'
  })
  updatedAt: Date;
}