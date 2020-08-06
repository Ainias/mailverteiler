import {AccessEasySyncModel} from "cordova-sites-user-management/dist/shared";
import {BaseDatabase} from "cordova-sites-database/dist/cordova-sites-database";
import {MailingList} from "./MailingList";
import {Person} from "./Person";

export class Membership extends AccessEasySyncModel {
    person: Person;
    list: MailingList;
    role: string;
    mailmanId: number;

    static getColumnDefinitions() {
        let columns = super.getColumnDefinitions();
        columns["role"] = {type: BaseDatabase.TYPES.STRING};
        columns["mailmanId"] = BaseDatabase.TYPES.INTEGER;

        return columns;
    }

    static getRelationDefinitions(){
        let relations = AccessEasySyncModel.getRelationDefinitions();
        relations["person"] = {
            target: Person.getSchemaName(),
            type: "many-to-one",
            joinColumn: true,
            sync: true,
        };
        relations["list"] = {
            target: MailingList.getSchemaName(),
            type: "many-to-one",
            joinColumn: true,
            sync: true,
        };
        return relations;
    }
}