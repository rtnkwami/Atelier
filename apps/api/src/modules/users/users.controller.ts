import { Controller, Post, Body, UsePipes, Get, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { ZodValidationPipe } from 'src/pipes/request.validation.pipe';
import {
  type CreateUser,
  CreateUserSchema,
  type UpdateUserProfile,
} from 'contracts';
import { User } from 'src/auth/user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CreateUserSchema))
  upsertUser(@User() userId: string, data: CreateUser) {
    return this.usersService.upsertUser(userId, data);
  }

  @Get()
  findOne(@User() userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Patch(':id')
  updateProfile(@User() userId: string, @Body() data: UpdateUserProfile) {
    return this.usersService.updateProfile(userId, data);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usersService.remove(+id);
  // }
}
