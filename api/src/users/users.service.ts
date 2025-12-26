import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';
import { UserSearchDto } from './dto/search-user.dto';
import { Prisma } from 'src/generated/prisma/client';

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

    public async searchUsers(filters?: UserSearchDto) {
        const page = filters?.page ?? 1;
        const limit = filters?.limit ?? 20;
        const skip = (page - 1) * limit;

        const where: Prisma.UserWhereInput = {
            name: filters?.name && {
                contains: filters.name,
                mode: 'insensitive',
            },

            email: filters?.email && {
                contains: filters.email,
                mode: 'insensitive',
            },

            createdAt: filters?.dateRange && {
                gte: filters.dateRange.from,
                lte: filters.dateRange.to,
            },
        };

        const [users, totalUsers] = await Promise.all([
            this.prisma.user.findMany({ where, skip, take: limit }),
            this.prisma.user.count({ where }),
        ]);

        return {
            users,
            page,
            perPage: limit,
            count: users.length,
            total: totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
        };
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
