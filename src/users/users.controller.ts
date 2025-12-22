import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { type Request } from 'express';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    createUser(@Body() data: CreateUserDto, @Req() request: Request) {
        const userId = request.auth?.payload.sub;
        return this.usersService.createUser(data, userId!);
    }

    @Get()
    searchUsers() {
        return this.usersService.searchUsers();
    }

    @Get(':id')
    getUser(@Param('id') id: string) {
        return this.usersService.getUser(id);
    }

    @Patch()
    updateUserProfile(@Req() request: Request, @Body() data: UpdateUserDto) {
        const userId = request.auth?.payload.sub;
        return this.usersService.updateUserProfile(userId!, data);
    }

    @Delete()
    deleteUserAccount(@Req() request: Request) {
        const userId = request.auth?.payload.sub;
        return this.usersService.deleteUser(userId!);
    }
}
