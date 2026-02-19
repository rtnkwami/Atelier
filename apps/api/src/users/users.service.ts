import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { CreateUser } from 'contracts';
import { User } from 'src/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly em: EntityManager) {}

  public async upsertUser(data: CreateUser) {
    const { email, avatar, sub } = data;

    const user = this.em.create(User, {
      id: sub,
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

  // findOne(id: number) {
  //   return `This action returns a #${id} user`;
  // }

  // update(id: number) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
