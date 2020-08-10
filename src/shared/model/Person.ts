import {AccessEasySyncModel} from "cordova-sites-user-management/dist/shared";
import {BaseDatabase} from "cordova-sites-database/dist/cordova-sites-database";

export class Person extends AccessEasySyncModel {

    mailmanId: string = null;
    surname: string = "";
    firstname: string = "";
    email: string = "";
    street: string = "";
    housenumber: string = "";
    addressSuffix: string = "";
    countrycode: string = "";
    zipcode: string = "";
    city: string = "";
    birthday: Date = null;
    comment: string = "";

    static SAVE_PATH: string = "/modifyPerson";

    static getColumnDefinitions() {
        let columns = super.getColumnDefinitions();
        columns["mailmanId"] = {
            type: BaseDatabase.TYPES.STRING,
            nullable: true,
        };
        columns["surname"] = {
            type: BaseDatabase.TYPES.STRING,
        };
        columns["firstname"] = {
            type: BaseDatabase.TYPES.STRING,
        };
        columns["email"] = {
            type: BaseDatabase.TYPES.STRING,
            unique: true,
        };
        columns["street"] = {
            type: BaseDatabase.TYPES.STRING,
            nullable: true
        };
        columns["housenumber"] = {
            type: BaseDatabase.TYPES.STRING,
            nullable: true
        };
        columns["addressSuffix"] = {
            type: BaseDatabase.TYPES.STRING,
            nullable: true
        };
        columns["countrycode"] = {
            type: BaseDatabase.TYPES.STRING,
            nullable: true
        };
        columns["zipcode"] = {
            type: BaseDatabase.TYPES.STRING,
            nullable: true
        };
        columns["city"] = {
            type: BaseDatabase.TYPES.STRING,
            nullable: true
        };
        columns["birthday"] = {
            type: BaseDatabase.TYPES.DATE,
            nullable: true
        };
        columns["comment"] = {
            type: BaseDatabase.TYPES.MEDIUMTEXT,
            nullable: true
        };
        return columns;
    }
}
Person.ACCESS_MODIFY = false;


BaseDatabase.addModel(Person);