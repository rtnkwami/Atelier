import { Controller, Post, Body, UsePipes, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { ZodValidationPipe } from 'src/pipes/request.validation.pipe';
import { type CreateUser, CreateUserSchema } from 'contracts';
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

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.usersService.update(+id, updateUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usersService.remove(+id);
  // }
}
