import { 
  Injectable, 
  UnauthorizedException, 
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
  Logger
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    try {
      if (!signupDto.email || !signupDto.password) {
        throw new BadRequestException('Email and password are required');
      }

      const user = await this.usersService.create(signupDto);
      
      if (!user) {
        throw new InternalServerErrorException('Failed to create user');
      }

      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
      };

      const token = this.jwtService.sign(payload);
      
      if (!token) {
        throw new InternalServerErrorException('Failed to generate access token');
      }

      return {
        access_token: token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      };
    } catch (error) {
      this.logger.error(`Signup failed for email ${signupDto.email}:`, error.message);
      
      if (error instanceof ConflictException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Failed to create user account');
    }
  }

  async login(loginDto: LoginDto) {
    try {
      if (!loginDto.email || !loginDto.password) {
        throw new BadRequestException('Email and password are required');
      }

      const user = await this.usersService.findByEmail(loginDto.email);
      
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('Account is deactivated');
      }

      const isPasswordValid = await this.usersService.validatePassword(
        loginDto.password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
      };

      const token = this.jwtService.sign(payload);
      
      if (!token) {
        throw new InternalServerErrorException('Failed to generate access token');
      }

      return {
        access_token: token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      };
    } catch (error) {
      this.logger.error(`Login failed for email ${loginDto.email}:`, error.message);
      
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Login process failed');
    }
  }
}
