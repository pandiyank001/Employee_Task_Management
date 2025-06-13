import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto, UpdateTaskDto, FilterTasksDto } from './dto/task.dto';
import { TaskStatus } from 'src/constant/task.enum';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    const taskData = {
      ...createTaskDto,
      userId,
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
    };

    const task = this.tasksRepository.create(taskData);
    return this.tasksRepository.save(task);
  }

  async findAll(filterDto: FilterTasksDto, userId: string): Promise<{
    tasks: Task[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { status, dueDate, search, page = 1, limit = 10 } = filterDto;
    
    const queryBuilder: SelectQueryBuilder<Task> = this.tasksRepository
      .createQueryBuilder('task')
      .where('task.userId = :userId', { userId });

    if (status) {
      queryBuilder.andWhere('task.status = :status', { status });
    }

    if (dueDate) {
      const targetDate = new Date(dueDate);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      queryBuilder.andWhere('task.dueDate >= :startDate AND task.dueDate < :endDate', {
        startDate: targetDate,
        endDate: nextDay,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    queryBuilder
      .orderBy('task.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [tasks, total] = await queryBuilder.getManyAndCount();

    return {
      tasks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId: string): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id, userId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string): Promise<Task> {
    const task = await this.findOne(id, userId);

    const updateData = {
      ...updateTaskDto,
      dueDate: updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : undefined,
    };

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        task[key] = updateData[key];
      }
    });

    return this.tasksRepository.save(task);
  }

  async markAsComplete(id: string, userId: string): Promise<Task> {
    const task = await this.findOne(id, userId);

    task.status = TaskStatus.COMPLETED;
    task.completedAt = new Date();

    return this.tasksRepository.save(task);
  }

  async remove(id: string, userId: string): Promise<{ message: string; id: string }> {
    const task = await this.findOne(id, userId);
    await this.tasksRepository.remove(task);
    
    return {
      message: 'Task deleted successfully',
      id: id
    };
  }

  async getTaskStats(userId: string): Promise<{
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
    overdue: number;
  }> {
    const now = new Date();
    
    const [total, completed, pending, inProgress, overdue] = await Promise.all([
      this.tasksRepository.count({ where: { userId } }),
      this.tasksRepository.count({ where: { userId, status: TaskStatus.COMPLETED } }),
      this.tasksRepository.count({ where: { userId, status: TaskStatus.PENDING } }),
      this.tasksRepository.count({ where: { userId, status: TaskStatus.IN_PROGRESS } }),
      this.tasksRepository
        .createQueryBuilder('task')
        .where('task.userId = :userId', { userId })
        .andWhere('task.status != :status', { status: TaskStatus.COMPLETED })
        .andWhere('task.dueDate < :now', { now })
        .getCount(),
    ]);

    return {
      total,
      completed,
      pending,
      inProgress,
      overdue,
    };
  }
}