import {
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  type Rel,
} from '@mikro-orm/core';
import { randomUUID } from 'crypto';
import { Reservation } from './reservation.entity';
import { Product } from './product.entity';

@Entity()
export class ReservationItem {
  @PrimaryKey()
  id: string = randomUUID();

  @ManyToOne({ entity: () => Product })
  product: Rel<Product>;

  @Property({ type: 'int' })
  quantity: number;

  @ManyToOne({ entity: () => Reservation })
  reservation: Rel<Product>;
}
