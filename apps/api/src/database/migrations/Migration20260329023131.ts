import { Migration } from '@mikro-orm/migrations';

export class Migration20260329023131 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table "product" alter column "images" drop default;`);
    this.addSql(
      `alter table "product" alter column "images" type jsonb using ("images"::jsonb);`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "product" alter column "images" type jsonb using ("images"::jsonb);`,
    );
    this.addSql(
      `alter table "product" alter column "images" set default '[]';`,
    );
  }
}
