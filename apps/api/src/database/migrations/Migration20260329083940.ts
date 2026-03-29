import { Migration } from '@mikro-orm/migrations';

export class Migration20260329083940 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table "product" drop constraint "product_name_unique";`);
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "product" add constraint "product_name_unique" unique ("name");`,
    );
  }
}
