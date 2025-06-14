import { 
  Injectable, 
  NotFoundException, 
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, QueryFailedError } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto, UpdateTaskDto, FilterTasksDto } from './dto/task.dto';
import { TaskStatus } from 'src/constant/task.enum';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    try {
      if (!createTaskDto.title || !userId) {
        throw new BadRequestException('Title and user ID are required');
      }

      const taskData = {
        ...createTaskDto,
        userId,
        dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
      };

      if (createTaskDto.dueDate && isNaN(new Date(createTaskDto.dueDate).getTime())) {
        throw new BadRequestException('Invalid due date format');
      }

      const task = this.tasksRepository.create(taskData);
      const savedTask = await this.tasksRepository.save(task);
      
      if (!savedTask) {
        throw new InternalServerErrorException('Failed to create task');
      }

      return savedTask;
    } catch (error) {
      this.logger.error(`Failed to create task for user ${userId}:`, error.message);
      
      if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }
      
      if (error instanceof QueryFailedError) {
        throw new BadRequestException('Invalid task data provided');
      }
      
      throw new InternalServerErrorException('Failed to create task');
    }
  }

  async findAll(filterDto: FilterTasksDto, userId: string): Promise<{
    tasks: Task[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

      const { status, dueDate, search, page = 1, limit = 10 } = filterDto;
      
      if (page < 1 || limit < 1 || limit > 100) {
        throw new BadRequestException('Invalid pagination parameters');
      }

      const queryBuilder: SelectQueryBuilder<Task> = this.tasksRepository
        .createQueryBuilder('task')
        .where('task.userId = :userId', { userId });

      if (status) {
        if (!Object.values(TaskStatus).includes(status as TaskStatus)) {
          throw new BadRequestException('Invalid task status');
        }
        queryBuilder.andWhere('task.status = :status', { status });
      }

      if (dueDate) {
        const targetDate = new Date(dueDate);
        if (isNaN(targetDate.getTime())) {
          throw new BadRequestException('Invalid due date format');
        }
        
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        queryBuilder.andWhere('task.dueDate >= :startDate AND task.dueDate < :endDate', {
          startDate: targetDate,
          endDate: nextDay,
        });
      }

      if (search) {
        const sanitizedSearch = search.trim();
        if (sanitizedSearch.length > 0) {
          queryBuilder.andWhere(
            '(task.title ILIKE :search OR task.description ILIKE :search)',
            { search: `%${sanitizedSearch}%` }
          );
        }
      }

      queryBuilder
        .orderBy('task.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      const [tasks, total] = await queryBuilder.getManyAndCount();

      return {
        tasks,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(`Failed to fetch tasks for user ${userId}:`, error.message);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Failed to retrieve tasks');
    }
  }

  async findOne(id: string, userId: string): Promise<Task> {
    try {
      if (!id || !userId) {
        throw new BadRequestException('Task ID and user ID are required');
      }

      const task = await this.tasksRepository.findOne({
        where: { id, userId },
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      return task;
    } catch (error) {
      this.logger.error(`Failed to find task ${id} for user ${userId}:`, error.message);
      
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Failed to retrieve task');
    }
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string): Promise<Task> {
    try {
      if (!id || !userId) {
        throw new BadRequestException('Task ID and user ID are required');
      }

      const task = await this.findOne(id, userId);

      if (updateTaskDto.dueDate && isNaN(new Date(updateTaskDto.dueDate).getTime())) {
        throw new BadRequestException('Invalid due date format');
      }

      if (updateTaskDto.status && !Object.values(TaskStatus).includes(updateTaskDto.status as TaskStatus)) {
        throw new BadRequestException('Invalid task status');
      }

      const updateData = {
        ...updateTaskDto,
        dueDate: updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : undefined,
      };

      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          task[key] = updateData[key];
        }
      });

      const updatedTask = await this.tasksRepository.save(task);
      
      if (!updatedTask) {
        throw new InternalServerErrorException('Failed to update task');
      }

      return updatedTask;
    } catch (error) {
      this.logger.error(`Failed to update task ${id} for user ${userId}:`, error.message);
      
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }
      
      if (error instanceof QueryFailedError) {
        throw new BadRequestException('Invalid task data provided');
      }
      
      throw new InternalServerErrorException('Failed to update task');
    }
  }

  async markAsComplete(id: string, userId: string): Promise<Task> {
    try {
      if (!id || !userId) {
        throw new BadRequestException('Task ID and user ID are required');
      }

      const task = await this.findOne(id, userId);

      if (task.status === TaskStatus.COMPLETED) {
        throw new BadRequestException('Task is already completed');
      }

      task.status = TaskStatus.COMPLETED;
      task.completedAt = new Date();

      const updatedTask = await this.tasksRepository.save(task);
      
      if (!updatedTask) {
        throw new InternalServerErrorException('Failed to mark task as complete');
      }

      return updatedTask;
    } catch (error) {
      this.logger.error(`Failed to mark task ${id} as complete for user ${userId}:`, error.message);
      
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Failed to mark task as complete');
    }
  }

  async remove(id: string, userId: string): Promise<{ message: string; id: string }> {
    try {
      if (!id || !userId) {
        throw new BadRequestException('Task ID and user ID are required');
      }

      const task = await this.findOne(id, userId);
      const result = await this.tasksRepository.remove(task);
      
      if (!result) {
        throw new InternalServerErrorException('Failed to delete task');
      }
      
      return {
        message: 'Task deleted successfully',
        id: id
      };
    } catch (error) {
      this.logger.error(`Failed to delete task ${id} for user ${userId}:`, error.message);
      
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Failed to delete task');
    }
  }

  async getTaskStats(userId: string): Promise<{
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
    overdue: number;
  }> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

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
    } catch (error) {
      this.logger.error(`Failed to get task stats for user ${userId}:`, error.message);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Failed to retrieve task statistics');
    }
  }
}