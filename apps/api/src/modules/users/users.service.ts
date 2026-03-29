import { EntityManager, Transactional, wrap } from '@mikro-orm/postgresql';
import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreateUser, UpdateUserProfile } from 'contracts';
import { User } from 'src/database/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly em: EntityManager) {}

  public async upsertUser(userId: string, data: CreateUser) {
    const { email, avatar } = data;

    const user = this.em.create(User, {
      id: userId,
      name: email,
      email,
      avatar,
    });
    await this.em.flush();

    return user;
  }

  // findAll() {
  //   return `This action returns all users`;
  // }

  public async getProfile(id: string) {
    const user = await this.em.findOne(User, id);

    if (!user) {
      throw new NotFoundException(`User ${id} does not exist`);
    }
    return user;
  }

  @Transactional()
  public async updateProfile(id: string, data: UpdateUserProfile) {
    const user = await this.em.findOne(User, id);

    if (!user) {
      throw new NotFoundException(`User ${id} does not exist`);
    }
    wrap(user).assign(data);

    return user;
  }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
