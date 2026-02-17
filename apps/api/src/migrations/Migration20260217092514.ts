import { Migration } from '@mikro-orm/migrations';

export class Migration20260217092514 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "user" ("id" varchar(255) not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "name" varchar(255) not null, "email" varchar(255) not null, "avatar" varchar(255) not null, constraint "user_pkey" primary key ("id"));`);

    this.addSql(`alter table "order" add column "user_id" varchar(255) not null;`);
    this.addSql(`alter table "order" add constraint "order_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "order" drop constraint "order_user_id_foreign";`);

    this.addSql(`drop table if exists "user" cascade;`);

    this.addSql(`alter table "order" drop column "user_id";`);
  }

}
