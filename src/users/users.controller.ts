import { 
  Controller, 
  Get, 
  UseGuards,
  HttpException,
  InternalServerErrorException,
  BadRequestException,
  Logger
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { ErrorResponseDto } from '../auth/dto/error-response.dto';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    type: UserProfileResponseDto
  })
  @ApiResponse({
    status: 400,
    type: ErrorResponseDto,
    examples: {
      missing_auth_data: {
        summary: 'Missing authentication data',
        value: {
          statusCode: 400,
          message: 'User authentication data is missing',
          error: 'Bad Request'
        }
      },
      missing_user_id: {
        summary: 'Missing user ID',
        value: {
          statusCode: 400,
          message: 'User ID is required',
          error: 'Bad Request'
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    type: ErrorResponseDto,
    examples: {
      unauthorized: {
        summary: 'Unauthorized access',
        value: {
          statusCode: 401,
          message: 'Unauthorized',
          error: 'Unauthorized'
        }
      },
      invalid_token: {
        summary: 'Invalid or expired token',
        value: {
          statusCode: 401,
          message: 'Unauthorized',
          error: 'Unauthorized'
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    type: ErrorResponseDto,
    example: {
      statusCode: 404,
      message: 'User not found',
      error: 'Not Found'
    }
  })
  @ApiResponse({
    status: 500,
    type: ErrorResponseDto,
    example: {
      statusCode: 500,
      message: 'Failed to retrieve user profile',
      error: 'Internal Server Error'
    }
  })
  @Get('me')
  async getMyProfile(@GetUser() user: User): Promise<UserProfileResponseDto> {
    try {
      if (!user) {
        throw new BadRequestException('User authentication data is missing');
      }

      if (!user.id) {
        throw new BadRequestException('User ID is required');
      }

      return await this.usersService.getProfile(user.id);
    } catch (error) {
      this.logger.error(`Failed to get profile for user ${user?.id}:`, error.message);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Failed to retrieve user profile');
    }
  }
}