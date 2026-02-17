import { OptionalProps, Property } from '@mikro-orm/core';

export class BaseEntity<Optional = never> {
  [OptionalProps]?: 'createdAt' | 'updatedAt' | Optional;

  @Property({ defaultRaw: 'now()' })
  createdAt: Date = new Date();

  @Property({
    onUpdate: () => new Date(),
    defaultRaw: 'now()',
  })
  updatedAt: Date = new Date();
}
