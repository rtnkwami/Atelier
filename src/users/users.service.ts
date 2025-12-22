import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    createUser(data: CreateUserDto) {
        const user = {
            id: data.sub,
            name: data.email,
            email: data.email,
            avatar: data.picture,
        };
        return this.prisma.user.create({ data: user });
    }

    findAll() {
        return `This action returns all users`;
    }

    findOne(id: number) {
        return `This action returns a #${id} user`;
    }

    updateUserProfile(id: string, data: UpdateUserDto) {
        return this.prisma.user.update({ where: { id }, data });
    }

    remove(id: number) {
        return `This action removes a #${id} user`;
    }
}
