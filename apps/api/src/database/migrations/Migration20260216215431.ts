import { Migration } from '@mikro-orm/migrations';

export class Migration20260216215431 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "product" ("id" uuid not null, "name" varchar(255) not null, "description" varchar(255) not null, "category" varchar(255) not null, "price" numeric(10,2) not null, "stock" int not null, "images" jsonb not null default '[]', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), constraint "product_pkey" primary key ("id"));`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "product" cascade;`);
  }
}
