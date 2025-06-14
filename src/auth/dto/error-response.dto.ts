import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error message',
    example: 'Bad Request'
  })
  message: string;

  @ApiProperty({
    description: 'Error type',
    example: 'Bad Request'
  })
  error: string;
}

export class ValidationErrorDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400
  })
  statusCode: number;

  @ApiProperty({
    description: 'Array of validation error messages',
    example: ['email must be an email', 'password should not be empty'],
    type: [String]
  })
  message: string[];

  @ApiProperty({
    description: 'Error type',
    example: 'Bad Request'
  })
  error: string;
}