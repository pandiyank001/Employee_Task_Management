import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Put,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  HttpException,
  InternalServerErrorException,
  BadRequestException,
  Logger
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody
} from '@nestjs/swagger';
import { TasksService } from './task.service';
import { CreateTaskDto, UpdateTaskDto, FilterTasksDto } from './dto/task.dto';
import { TaskResponseDto, TaskListResponseDto, TaskStatsResponseDto, ErrorResponseDto, SuccessResponseDto } from './dto/task-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Tasks')
@ApiBearerAuth('access-token')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  private readonly logger = new Logger(TasksController.name);

  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new task',
    operationId: 'createTask'
  })
  @ApiBody({ 
    type: CreateTaskDto,
    required: true,
    examples: {
      example1: {
        summary: 'Basic task creation',
        value: {
          title: 'Complete project documentation',
          description: 'Write comprehensive documentation for the new feature',
          priority: 'HIGH',
          dueDate: '2024-12-31T23:59:59.000Z'
        }
      }
    }
  })
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @GetUser() user: User,
  ) {
    try {
      if (!user?.id) {
        throw new BadRequestException('User information is required');
      }

      return await this.tasksService.create(createTaskDto, user.id);
    } catch (error) {
      this.logger.error(`Failed to create task for user ${user?.id}:`, error.message);
      
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create task');
    }
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all tasks with optional filters',
    operationId: 'getAllTasks'
  })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
    example: 'PENDING'
  })
  @ApiQuery({ 
    name: 'dueDate', 
    required: false, 
    type: 'string',
    format: 'date-time',
    example: '2024-12-31T23:59:59.000Z'
  })
  @ApiQuery({ 
    name: 'search', 
    required: false, 
    type: 'string',
    example: 'documentation'
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    type: 'number',
    minimum: 1,
    example: 1
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: 'number',
    minimum: 1,
    maximum: 100,
    example: 10
  })
  async findAll(
    @Query() filterDto: FilterTasksDto,
    @GetUser() user: User,
  ) {
    try {
      if (!user?.id) {
        throw new BadRequestException('User information is required');
      }

      return await this.tasksService.findAll(filterDto, user.id);
    } catch (error) {
      this.logger.error(`Failed to fetch tasks for user ${user?.id}:`, error.message);
      
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve tasks');
    }
  }

  @Get('stats')
  @ApiOperation({ 
    summary: 'Get task statistics for the user',
    operationId: 'getTaskStats'
  })
  async getStats(@GetUser() user: User) {
    try {
      if (!user?.id) {
        throw new BadRequestException('User information is required');
      }

      return await this.tasksService.getTaskStats(user.id);
    } catch (error) {
      this.logger.error(`Failed to get task stats for user ${user?.id}:`, error.message);
      
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve task statistics');
    }
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get a specific task by ID',
    operationId: 'getTaskById'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Task UUID', 
    type: 'string',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ) {
    try {
      if (!user?.id) {
        throw new BadRequestException('User information is required');
      }

      return await this.tasksService.findOne(id, user.id);
    } catch (error) {
      this.logger.error(`Failed to find task ${id} for user ${user?.id}:`, error.message);
      
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve task');
    }
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Update a task',
    operationId: 'updateTask'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Task UUID', 
    type: 'string',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiBody({ 
    type: UpdateTaskDto,
    required: true,
    examples: {
      example1: {
        summary: 'Update task with new status',
        value: {
          title: 'Updated task title',
          description: 'Updated description',
          status: 'IN_PROGRESS',
          priority: 'HIGH'
        }
      }
    }
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @GetUser() user: User,
  ) {
    try {
      if (!user?.id) {
        throw new BadRequestException('User information is required');
      }

      return await this.tasksService.update(id, updateTaskDto, user.id);
    } catch (error) {
      this.logger.error(`Failed to update task ${id} for user ${user?.id}:`, error.message);
      
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update task');
    }
  }

  @Patch(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Mark a task as complete',
    operationId: 'markTaskComplete'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Task UUID', 
    type: 'string',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  async markAsComplete(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ) {
    try {
      if (!user?.id) {
        throw new BadRequestException('User information is required');
      }

      return await this.tasksService.markAsComplete(id, user.id);
    } catch (error) {
      this.logger.error(`Failed to mark task ${id} as complete for user ${user?.id}:`, error.message);
      
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to mark task as complete');
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Delete a task',
    operationId: 'deleteTask'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Task UUID', 
    type: 'string',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ) {
    try {
      if (!user?.id) {
        throw new BadRequestException('User information is required');
      }

      return await this.tasksService.remove(id, user.id);
    } catch (error) {
      this.logger.error(`Failed to delete task ${id} for user ${user?.id}:`, error.message);
      
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete task');
    }
  }
}