import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus, 
  Get, 
  UseGuards,
  HttpException,
  InternalServerErrorException,
  BadRequestException
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('signup')
  async signup(@Body() signupDto: SignupDto): Promise<AuthResponseDto> {
    try {
      return await this.authService.signup(signupDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create account');
    }
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    try {
      return await this.authService.login(loginDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Login failed');
    }
  }
}
