import { AccessEasySyncModel } from "cordova-sites-user-management/dist/shared";
import {UserManager} from "cordova-sites-user-management/dist/server";
import {BaseDatabase} from "cordova-sites-database/dist/BaseDatabase";

const crypto = require("crypto");

export class MailingList extends AccessEasySyncModel{

    mailmanId: string;
    password: string;
    salt: string;

    static hashPassword(list, pw){
        if (!list.salt) {
            list.salt = UserManager._generateSalt();
        }
        let hash = crypto.createHmac("sha512", list.salt + UserManager.PEPPER);
        hash.update(pw);
        return hash.digest("hex");
    }

    static getColumnDefinitions() {
        let columns = super.getColumnDefinitions();
        columns["mailmanId"] = {
            type: BaseDatabase.TYPES.STRING,
            nullable: true,
            unique: true,
        };
        columns["password"] = {
            type: BaseDatabase.TYPES.STRING,
        };
        columns["salt"] = {
            type: BaseDatabase.TYPES.STRING,
        };
        return columns;
    }
}
