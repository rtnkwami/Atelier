import {
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { Order } from './order.entity';

@Entity()
export class User extends BaseEntity<'avatar'> {
  @PrimaryKey()
  id: string;

  @Property()
  name: string;

  @Property()
  email: string;

  @Property()
  avatar: string;

  @OneToMany(() => Order, (order) => order.user)
  orders = new Collection<Order>(this);
}
