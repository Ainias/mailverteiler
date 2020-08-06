import {MigrationInterface, QueryRunner} from "typeorm";
import {MigrationHelper} from "js-helper/dist/shared/MigrationHelper";
import {Membership} from "./models/v1/Membership";

export class MembershipInit1000000008000 implements MigrationInterface {

    _isServer(): boolean {
        return (typeof document !== "object")
    }

    async down(queryRunner: QueryRunner): Promise<any> {
        return undefined
    }

    async up(queryRunner: QueryRunner): Promise<any> {
        if (this._isServer()) {
            await queryRunner.query("ALTER TABLE person ENGINE=InnoDB;");
            await queryRunner.query("ALTER TABLE person MODIFY id INT NOT NULL AUTO_INCREMENT;");
        }
        await MigrationHelper.addTableFromModelClass(Membership, queryRunner);
    }

}