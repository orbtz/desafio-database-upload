import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AlterTransactionsTable1601495266954 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {

    await queryRunner.changeColumn(
      'transactions',

      new TableColumn({
        name: 'value',
        type: 'varchar',
      }),

      new TableColumn({
        name: 'value',
        type: 'float4'
      })
    )

  }

  public async down(queryRunner: QueryRunner): Promise<any> {

    await queryRunner.changeColumn(
      'transactions',

      new TableColumn({
        name: 'value',
        type: 'float4'
      }),

      new TableColumn({
        name: 'value',
        type: 'varchar',
      })
    )

  }
}
