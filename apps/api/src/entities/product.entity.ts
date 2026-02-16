import { DecimalType, Entity, JsonType, PrimaryKey, Property } from "@mikro-orm/core";
import { BaseEntity } from "./base.entity";

@Entity()
export class Product extends BaseEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string;

  @Property()
  name: string;

  @Property()
  description: string;
  
  @Property()
  category: string;

  @Property({
    type: new DecimalType('number'),
    precision: 10,
    scale: 2
  })
  price: number;

  @Property()
  stock: number;

  @Property({ type: new JsonType(), default: '[]' })
  images: string[];
}