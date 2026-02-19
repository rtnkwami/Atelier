import {
  BaseEntity,
  DecimalType,
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  type Rel,
} from '@mikro-orm/core';
import { Order } from './order.entity';
import { Product } from './product.entity';
import { randomUUID } from 'crypto';

@Entity()
export class OrderItem extends BaseEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @Property()
  quantity: number;

  @Property({
    type: new DecimalType('number'),
    precision: 10,
    scale: 2,
  })
  price: number;

  @ManyToOne({ entity: () => Order })
  order: Rel<Order>;

  @ManyToOne({ entity: () => Product })
  product: Rel<Product>;
}
