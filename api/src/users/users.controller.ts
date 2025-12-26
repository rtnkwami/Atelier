import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Req,
    Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { type Request } from 'express';
import { UserSearchDto } from './dto/search-user.dto';

@Controller('users')
export class UsersController {
    public constructor(private readonly usersService: UsersService) {}

    @Post()
    private createUser(@Body() data: CreateUserDto, @Req() request: Request) {
        const userId = request.auth?.payload.sub;
        return this.usersService.createUser(data, userId!);
    }

    @Get()
    private searchUsers(@Query() query: UserSearchDto) {
        return this.usersService.searchUsers(query);
    }

    @Get(':id')
    private getUser(@Param('id') id: string) {
        return this.usersService.getUser(id);
    }

    @Patch()
    private updateUserProfile(
        @Req() request: Request,
        @Body() data: UpdateUserDto,
    ) {
        const userId = request.auth?.payload.sub;
        return this.usersService.updateUserProfile(userId!, data);
    }

    @Delete()
    private deleteUserAccount(@Req() request: Request) {
        const userId = request.auth?.payload.sub;
        return this.usersService.deleteUser(userId!);
    }
}
