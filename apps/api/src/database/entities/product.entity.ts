import {
  Collection,
  DecimalType,
  Entity,
  JsonType,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { randomUUID } from 'crypto';
import { ReservationItem } from './reservation-item.entity';
import { OrderItem } from './order-item.entity';

@Entity()
export class Product extends BaseEntity<'description' | 'images'> {
  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @Property()
  name: string;

  @Property()
  description?: string;

  @Property()
  category: string;

  @Property({
    type: new DecimalType('number'),
    precision: 10,
    scale: 2,
  })
  price: number;

  @Property()
  stock: number;

  @Property({ type: JsonType })
  images: string[] = [];

  @OneToMany(() => ReservationItem, (reservation) => reservation.product)
  reservations = new Collection<ReservationItem>(this);

  @OneToMany(() => OrderItem, (order) => order.product)
  orders = new Collection<OrderItem>(this);
}
