import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class User {
  @ApiProperty({
    example: 'uuid-string'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'user@example.com'
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    example: 'John'
  })
  @Column()
  firstName: string;

  @ApiProperty({
    example: 'Doe'
  })
  @Column()
  lastName: string;

  @Column()
  @Exclude()
  password: string;

  @ApiProperty({
    example: true
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z'
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z'
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
