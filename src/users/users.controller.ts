import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMyProfile(@GetUser() user: User) {
    return this.usersService.getProfile(user.id);
  }
}