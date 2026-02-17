import {
  DecimalType,
  Entity,
  JsonType,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { randomUUID } from 'crypto';

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

  @Property({ type: new JsonType(), default: '[]' })
  images?: string[];
}
