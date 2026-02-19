import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUser } from 'contracts';
import { User } from 'src/entities/user.entity';

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

  updateProfile(id: string) {
    return `This action updates a #${id} user`;
  }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
