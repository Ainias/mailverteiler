import {MigrationInterface, QueryRunner} from "typeorm";
import {MigrationHelper} from "js-helper/dist/shared/MigrationHelper";
import {Person} from "./models/v1/Person";
import {MailingList} from "./models/v1/MailingList";

export class MailingListInit1000000007000 implements MigrationInterface {

    _isServer(): boolean {
        return (typeof document !== "object")
    }

    async down(queryRunner: QueryRunner): Promise<any> {
        return undefined
    }

    async up(queryRunner: QueryRunner): Promise<any> {
        await MigrationHelper.addTableFromModelClass(MailingList, queryRunner);
    }

}