import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';
import { TaskStatus, TaskPriority } from 'src/constant/task.enum';

@Entity('tasks')
export class Task {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Complete project documentation',
    maxLength: 255,
  })
  @Column()
  title: string;

  @ApiPropertyOptional({
    example: 'Write comprehensive documentation for the new feature including API endpoints and usage examples',
    type: 'string',
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({
    enum: TaskStatus,
    example: TaskStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status: TaskStatus;

  @ApiProperty({
    enum: TaskPriority,
    example: TaskPriority.MEDIUM,
  })
  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @ApiPropertyOptional({
    example: '2024-12-31T23:59:59.000Z',
    format: 'date-time',
    type: 'string',
  })
  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date | null;

  @ApiPropertyOptional({
    example: '2024-12-25T10:30:00.000Z',
    format: 'date-time',
    type: 'string',
  })
  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    format: 'uuid',
  })
  @Column('uuid')
  userId: string;

  @ApiPropertyOptional({
    type: () => User,
  })
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T12:00:00.000Z',
    format: 'date-time',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}