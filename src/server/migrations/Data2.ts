import {MigrationInterface, QueryRunner} from "typeorm";
import {UserManager} from "cordova-sites-user-management/dist/server/v1/UserManager";
import {User} from "cordova-sites-user-management/dist/shared/v1/model/User";
import {Helper} from "js-helper/dist/shared/Helper";

export class Data1000000005001 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<any> {
        await this._insertAccesses(queryRunner);
        await this._insertRoles(queryRunner);
        await this._insertRoleChildren(queryRunner);
        await this._insertRoleAccess(queryRunner);
    }

    async _insertAccesses(queryRunner: QueryRunner) {
        let accesses = await queryRunner.query("SELECT * FROM access");
        accesses = Helper.arrayToObject(accesses, obj => obj.id);

        if (Helper.isNull(accesses['7']))
            await queryRunner.query("INSERT INTO `access` VALUES " + "(7,'2019-06-04 16:51:17','2019-06-04 16:51:17',2,0,'view-person','view persons');");
        if (Helper.isNull(accesses['8']))
            await queryRunner.query("INSERT INTO `access` VALUES " + "(8,'2019-06-04 16:51:17','2019-06-04 16:51:17',2,0,'modify-person','add, edit, delete person');");
        if (Helper.isNull(accesses['9']))
            await queryRunner.query("INSERT INTO `access` VALUES " + "(9,'2019-06-04 16:51:17','2019-06-04 16:51:17',2,0,'view-list','view lists');");
        if (Helper.isNull(accesses['10']))
            await queryRunner.query("INSERT INTO `access` VALUES " + "(10,'2019-06-04 16:51:17','2019-06-04 16:51:17',2,0,'modify-list','add, edit, delete lists');");
    }

    async _insertRoles(queryRunner: QueryRunner) {
        let roles = await queryRunner.query("SELECT * FROM role");
        roles = Helper.arrayToObject(roles, obj => obj.id);

        if (Helper.isNull(roles['6']))
            await queryRunner.query("INSERT INTO `role` VALUES " + "(6,'2019-06-04 16:51:17','2019-06-04 16:51:17',2,0,'mail-admin','role for user that are mail admin');");
    }

    async _insertRoleChildren(queryRunner: QueryRunner) {
        let roleChildren = await queryRunner.query("SELECT * FROM roleChildren");
        roleChildren = Helper.arrayToObject(roleChildren, obj => obj.childId + "," + obj.parentId);

        if (Helper.isNull(roleChildren['5,6']))
            await queryRunner.query("INSERT INTO `roleChildren` (childId, parentId) VALUES " + "(5,6)");
    }

    async _insertRoleAccess(queryRunner: QueryRunner) {
        let roleAccesses = await queryRunner.query("SELECT * FROM roleAccess");
        roleAccesses = Helper.arrayToObject(roleAccesses, obj => obj.roleId + "," + obj.accessId);

        if (Helper.isNull(roleAccesses['6,7']))
            await queryRunner.query("INSERT INTO `roleAccess` (roleId, accessId) VALUES " + "(6,7);");
        if (Helper.isNull(roleAccesses['6,8']))
            await queryRunner.query("INSERT INTO `roleAccess` (roleId, accessId) VALUES " + "(6,8);");
        if (Helper.isNull(roleAccesses['6,9']))
            await queryRunner.query("INSERT INTO `roleAccess` (roleId, accessId) VALUES " + "(6,9);");
        if (Helper.isNull(roleAccesses['6,10']))
            await queryRunner.query("INSERT INTO `roleAccess` (roleId, accessId) VALUES " + "(6,10);");
    }

    down(queryRunner: QueryRunner): Promise<any> {
        return undefined;
    }
}