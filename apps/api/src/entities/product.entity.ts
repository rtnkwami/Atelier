import { DecimalType, Entity, JsonType, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Product {
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

  @Property({ defaultRaw: 'now()' })
  createdAt: Date = new Date();

  @Property({
    onUpdate: () => new Date(),
    defaultRaw: 'now()'
  })
  updatedAt: Date = new Date();
}