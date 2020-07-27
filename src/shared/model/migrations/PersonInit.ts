import {MigrationInterface, QueryRunner} from "typeorm";
import {MigrationHelper} from "js-helper/dist/shared/MigrationHelper";
import {Person} from "./models/v1/Person";

export class PersonInit1000000006000 implements MigrationInterface {

    _isServer(): boolean {
        return (typeof document !== "object")
    }

    async down(queryRunner: QueryRunner): Promise<any> {
        return undefined
    }

    async up(queryRunner: QueryRunner): Promise<any> {
        if (this._isServer()) {
            await queryRunner.query("ALTER TABLE person CHANGE email1 email VARCHAR(255) NOT NULL DEFAULT '';");
            await queryRunner.query("ALTER TABLE person CHANGE street1 street VARCHAR(255) DEFAULT '';");
            await queryRunner.query("ALTER TABLE person CHANGE houseno1 housenumber VARCHAR(255) DEFAULT '';");
            await queryRunner.query("ALTER TABLE person CHANGE roomno1 addressSuffix VARCHAR(255) DEFAULT '';");
            await queryRunner.query("ALTER TABLE person CHANGE countrycode1 countrycode VARCHAR(255) DEFAULT '';");
            await queryRunner.query("ALTER TABLE person CHANGE zipcode1 zipcode VARCHAR(255) DEFAULT '';");
            await queryRunner.query("ALTER TABLE person CHANGE city1 city VARCHAR(255) DEFAULT '';");

            await queryRunner.query("ALTER TABLE person ADD COLUMN createdAt DATETIME NOT NULL DEFAULT NOW()");
            await queryRunner.query("ALTER TABLE person ADD COLUMN updatedAt DATETIME NOT NULL DEFAULT NOW()");
            await queryRunner.query("ALTER TABLE person ADD COLUMN version INTEGER NOT NULL DEFAULT 0");
            await queryRunner.query("ALTER TABLE person ADD COLUMN deleted SMALLINT(1) NOT NULL DEFAULT 0");
        }
        else {
            let table = MigrationHelper.createTableFromModelClass(Person);
            await queryRunner.createTable(table);
        }
    }
}