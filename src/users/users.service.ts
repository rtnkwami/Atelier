import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UsersService {
    public constructor(private readonly prisma: PrismaService) {}

    public createUser(data: CreateUserDto, userId: string) {
        const user = {
            id: userId,
            name: data.email,
            email: data.email,
            avatar: data.picture,
        };
        return this.prisma.user.create({ data: user });
    }

    public searchUsers() {
        return this.prisma.user.findMany();
    }

    public getUser(id: string) {
        return this.prisma.user.findUnique({ where: { id } });
    }

    public updateUserProfile(id: string, data: UpdateUserDto) {
        return this.prisma.user.update({ where: { id }, data });
    }

    public async deleteUser(id: string) {
        return this.prisma.user.delete({ where: { id } });
    }
}
