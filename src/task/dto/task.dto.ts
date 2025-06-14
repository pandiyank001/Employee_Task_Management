import { IsString, IsOptional, IsEnum, IsDateString, IsNotEmpty, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from 'src/constant/task.enum';

export class CreateTaskDto {
  @ApiProperty({
    example: 'Complete project documentation',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    example: 'Write comprehensive documentation for the new feature including API endpoints and usage examples',
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    enum: TaskPriority,
    example: TaskPriority.HIGH,
  })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({
    example: '2024-12-31T23:59:59.000Z',
    format: 'date-time',
  })
  @IsDateString()
  @IsOptional()
  dueDate?: string;
}

export class UpdateTaskDto {
  @ApiPropertyOptional({
    example: 'Updated task title',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({
    example: 'Updated task description with more details',
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({
    enum: TaskPriority,
    example: TaskPriority.HIGH,
  })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({
    example: '2024-12-31T23:59:59.000Z',
    format: 'date-time',
  })
  @IsDateString()
  @IsOptional()
  dueDate?: string;
}

export class FilterTasksDto {
  @ApiPropertyOptional({
    enum: TaskStatus,
    example: TaskStatus.PENDING,
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({
    example: '2024-12-31T23:59:59.000Z',
    format: 'date-time',
  })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({
    example: 'project documentation',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    example: 1,
    minimum: 1,
    default: 1,
  })
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  limit?: number = 10;
}