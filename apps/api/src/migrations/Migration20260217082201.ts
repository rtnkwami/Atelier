import { Migration } from '@mikro-orm/migrations';

export class Migration20260217082201 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "reservation" ("id" uuid not null, "created_at" timestamptz not null, "expires_at" timestamptz not null, constraint "reservation_pkey" primary key ("id"));`);

    this.addSql(`create table "reservation_item" ("id" varchar(255) not null, "reservation_id" uuid not null, "product_id" uuid not null, "quantity" int not null, constraint "reservation_item_pkey" primary key ("id"));`);

    this.addSql(`alter table "reservation_item" add constraint "reservation_item_reservation_id_foreign" foreign key ("reservation_id") references "reservation" ("id") on update cascade;`);
    this.addSql(`alter table "reservation_item" add constraint "reservation_item_product_id_foreign" foreign key ("product_id") references "product" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "reservation_item" drop constraint "reservation_item_reservation_id_foreign";`);

    this.addSql(`drop table if exists "reservation" cascade;`);

    this.addSql(`drop table if exists "reservation_item" cascade;`);
  }

}
