import { Migration } from '@mikro-orm/migrations';

export class Migration20260219145323 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "order" drop constraint if exists "order_status_check";`);

    this.addSql(`alter table "order" alter column "status" type text using ("status"::text);`);
    this.addSql(`alter table "order" alter column "status" set default 'pending_payment';`);
    this.addSql(`alter table "order" add constraint "order_status_check" check("status" in ('pending_payment', 'paid', 'cancelled', 'completed'));`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "order" drop constraint if exists "order_status_check";`);

    this.addSql(`alter table "order" alter column "status" type text using ("status"::text);`);
    this.addSql(`alter table "order" alter column "status" set default 'pending';`);
    this.addSql(`alter table "order" add constraint "order_status_check" check("status" in ('pending', 'cancelled', 'completed'));`);
  }

}
