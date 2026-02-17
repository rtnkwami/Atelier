import { Migration } from '@mikro-orm/migrations';

export class Migration20260217091703 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "order" ("id" uuid not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "status" text check ("status" in ('pending', 'cancelled', 'completed')) not null default 'pending', "total" numeric(10,2) not null, constraint "order_pkey" primary key ("id"));`);

    this.addSql(`create table "order_item" ("id" uuid not null, "quantity" int not null, "price" numeric(10,2) not null, "order_id" uuid not null, "product_id" uuid not null, constraint "order_item_pkey" primary key ("id"));`);

    this.addSql(`alter table "order_item" add constraint "order_item_order_id_foreign" foreign key ("order_id") references "order" ("id") on update cascade;`);
    this.addSql(`alter table "order_item" add constraint "order_item_product_id_foreign" foreign key ("product_id") references "product" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "order_item" drop constraint "order_item_order_id_foreign";`);

    this.addSql(`drop table if exists "order" cascade;`);

    this.addSql(`drop table if exists "order_item" cascade;`);
  }

}
