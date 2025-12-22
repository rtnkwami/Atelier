import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    createUser(data: CreateUserDto, userId: string) {
        const user = {
            id: userId,
            name: data.email,
            email: data.email,
            avatar: data.picture,
        };
        return this.prisma.user.create({ data: user });
    }

    searchUsers() {
        return this.prisma.user.findMany();
    }

    getUser(id: string) {
        return this.prisma.user.findUnique({ where: { id } });
    }

    updateUserProfile(id: string, data: UpdateUserDto) {
        return this.prisma.user.update({ where: { id }, data });
    }

    async deleteUser(id: string) {
        return this.prisma.user.delete({ where: { id } });
    }
}
