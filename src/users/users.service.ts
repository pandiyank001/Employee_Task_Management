import { 
  Injectable, 
  ConflictException, 
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    try {
      if (!userData) {
        throw new BadRequestException('User data is required');
      }

      if (!userData.email || !userData.password) {
        throw new BadRequestException('Email and password are required');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new BadRequestException('Invalid email format');
      }

      if (userData.password.length < 6) {
        throw new BadRequestException('Password must be at least 6 characters long');
      }

      const existingUser = await this.usersRepository.findOne({
        where: { email: userData.email.toLowerCase().trim() },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      if (!hashedPassword) {
        throw new InternalServerErrorException('Failed to process password');
      }
      
      const user = this.usersRepository.create({
        ...userData,
        email: userData.email.toLowerCase().trim(),
        password: hashedPassword,
        isActive: userData.isActive !== undefined ? userData.isActive : true,
      });

      const savedUser = await this.usersRepository.save(user);
      
      if (!savedUser) {
        throw new InternalServerErrorException('Failed to create user');
      }

      this.logger.log(`User created successfully with email: ${userData.email}`);
      return savedUser;

    } catch (error) {
      this.logger.error(`Failed to create user with email ${userData?.email}:`, error.message);
      
      if (error instanceof BadRequestException || 
          error instanceof ConflictException || 
          error instanceof InternalServerErrorException) {
        throw error;
      }
      
      if (error instanceof QueryFailedError) {
        if (error.message.includes('duplicate key')) {
          throw new ConflictException('Email already exists');
        }
        throw new BadRequestException('Invalid user data provided');
      }
      
      throw new InternalServerErrorException('Failed to create user account');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      if (!email) {
        throw new BadRequestException('Email is required');
      }

      if (typeof email !== 'string') {
        throw new BadRequestException('Email must be a string');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new BadRequestException('Invalid email format');
      }

      const user = await this.usersRepository.findOne({ 
        where: { email: email.toLowerCase().trim() } 
      });

      return user;

    } catch (error) {
      this.logger.error(`Failed to find user by email ${email}:`, error.message);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      if (error instanceof QueryFailedError) {
        throw new InternalServerErrorException('Database query failed');
      }
      
      throw new InternalServerErrorException('Failed to find user by email');
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      if (!id) {
        throw new BadRequestException('User ID is required');
      }

      if (typeof id !== 'string') {
        throw new BadRequestException('User ID must be a string');
      }

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        throw new BadRequestException('Invalid user ID format');
      }

      const user = await this.usersRepository.findOne({ where: { id } });

      return user;

    } catch (error) {
      this.logger.error(`Failed to find user by ID ${id}:`, error.message);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      if (error instanceof QueryFailedError) {
        throw new InternalServerErrorException('Database query failed');
      }
      
      throw new InternalServerErrorException('Failed to find user by ID');
    }
  }

  async getProfile(userId: string): Promise<Omit<User, 'password'>> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

      if (typeof userId !== 'string') {
        throw new BadRequestException('User ID must be a string');
      }

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        throw new BadRequestException('Invalid user ID format');
      }

      const user = await this.usersRepository.findOne({ 
        where: { id: userId },
        select: ['id', 'email', 'firstName', 'lastName', 'isActive', 'createdAt', 'updatedAt']
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!user.isActive) {
        throw new BadRequestException('User account is deactivated');
      }

      return user;

    } catch (error) {
      this.logger.error(`Failed to get profile for user ${userId}:`, error.message);
      
      if (error instanceof BadRequestException || 
          error instanceof NotFoundException) {
        throw error;
      }
      
      if (error instanceof QueryFailedError) {
        throw new InternalServerErrorException('Database query failed');
      }
      
      throw new InternalServerErrorException('Failed to retrieve user profile');
    }
  }
  
  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      if (!plainPassword || !hashedPassword) {
        throw new BadRequestException('Both passwords are required for validation');
      }

      if (typeof plainPassword !== 'string' || typeof hashedPassword !== 'string') {
        throw new BadRequestException('Passwords must be strings');
      }

      if (plainPassword.length === 0) {
        throw new BadRequestException('Password cannot be empty');
      }

      const isValid = await bcrypt.compare(plainPassword, hashedPassword);
      
      return isValid;

    } catch (error) {
      this.logger.error('Password validation failed:', error.message);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      if (error.name === 'Error' && error.message.includes('Invalid salt')) {
        throw new InternalServerErrorException('Invalid password hash format');
      }
      
      throw new InternalServerErrorException('Password validation failed');
    }
  }


  async updateUserStatus(userId: string, isActive: boolean): Promise<User> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

      if (typeof isActive !== 'boolean') {
        throw new BadRequestException('isActive must be a boolean value');
      }

      const user = await this.findById(userId);
      
      if (!user) {
        throw new NotFoundException('User not found');
      }

      user.isActive = isActive;
      const updatedUser = await this.usersRepository.save(user);

      if (!updatedUser) {
        throw new InternalServerErrorException('Failed to update user status');
      }

      this.logger.log(`User ${userId} status updated to ${isActive ? 'active' : 'inactive'}`);
      return updatedUser;

    } catch (error) {
      this.logger.error(`Failed to update status for user ${userId}:`, error.message);
      
      if (error instanceof BadRequestException || 
          error instanceof NotFoundException || 
          error instanceof InternalServerErrorException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Failed to update user status');
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      if (!userId || !currentPassword || !newPassword) {
        throw new BadRequestException('User ID, current password, and new password are required');
      }

      if (newPassword.length < 6) {
        throw new BadRequestException('New password must be at least 6 characters long');
      }

      if (currentPassword === newPassword) {
        throw new BadRequestException('New password must be different from current password');
      }

      const user = await this.usersRepository.findOne({ 
        where: { id: userId },
        select: ['id', 'password'] 
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const isCurrentPasswordValid = await this.validatePassword(currentPassword, user.password);
      
      if (!isCurrentPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 12);
      
      if (!hashedNewPassword) {
        throw new InternalServerErrorException('Failed to process new password');
      }

      await this.usersRepository.update(userId, { password: hashedNewPassword });

      this.logger.log(`Password changed successfully for user ${userId}`);
      return true;

    } catch (error) {
      this.logger.error(`Failed to change password for user ${userId}:`, error.message);
      
      if (error instanceof BadRequestException || 
          error instanceof NotFoundException || 
          error instanceof InternalServerErrorException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Failed to change password');
    }
  }
}