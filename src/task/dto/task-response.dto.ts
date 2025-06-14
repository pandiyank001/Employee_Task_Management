import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from 'src/constant/task.enum';

export class TaskResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    example: 'Complete project documentation',
  })
  title: string;

  @ApiPropertyOptional({
    example: 'Write comprehensive documentation for the new feature including API endpoints and usage examples',
  })
  description?: string;

  @ApiProperty({
    enum: TaskStatus,
    example: TaskStatus.PENDING,
  })
  status: TaskStatus;

  @ApiProperty({
    enum: TaskPriority,
    example: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @ApiPropertyOptional({
    example: '2024-12-31T23:59:59.000Z',
    format: 'date-time',
  })
  dueDate?: Date;

  @ApiPropertyOptional({
    example: '2024-12-25T10:30:00.000Z',
    format: 'date-time',
  })
  completedAt?: Date;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    format: 'uuid',
  })
  userId: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T12:00:00.000Z',
    format: 'date-time',
  })
  updatedAt: Date;
}

export class TaskListResponseDto {
  @ApiProperty({
    type: [TaskResponseDto],
  })
  data: TaskResponseDto[];

  @ApiProperty({
    example: 50,
  })
  total: number;

  @ApiProperty({
    example: 1,
  })
  page: number;

  @ApiProperty({
    example: 10,
  })
  limit: number;

  @ApiProperty({
    example: 5,
  })
  totalPages: number;
}

export class TaskStatsResponseDto {
  @ApiProperty({
    example: 25,
  })
  total: number;

  @ApiProperty({
    example: 10,
  })
  pending: number;

  @ApiProperty({
    example: 8,
  })
  inProgress: number;

  @ApiProperty({
    example: 7,
  })
  completed: number;

  @ApiProperty({
    example: 5,
  })
  overdue: number;
}

export class ErrorResponseDto {
  @ApiProperty({
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    example: 'Bad Request',
  })
  error: string;

  @ApiProperty({
    example: 'Validation failed',
  })
  message: string;

  @ApiProperty({
    example: '2024-01-01T12:00:00.000Z',
    format: 'date-time',
  })
  timestamp: string;

  @ApiProperty({
    example: '/api/tasks',
  })
  path: string;
}

export class SuccessResponseDto {
  @ApiProperty({
    example: 'Task created successfully',
  })
  message: string;

  @ApiProperty({
    type: TaskResponseDto,
  })
  data: TaskResponseDto;
}