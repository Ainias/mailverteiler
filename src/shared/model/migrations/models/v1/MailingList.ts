import {AccessEasySyncModel} from "cordova-sites-user-management/dist/shared";
import {BaseDatabase} from "cordova-sites-database/dist/cordova-sites-database";

export class MailingList extends AccessEasySyncModel {

    name: string = "";
    moderators: any = [];
    allowEverySenderWithoutHold: boolean = false;
    allowWithoutHold: any = [];

    static getColumnDefinitions() {
        let columns = super.getColumnDefinitions();
        columns["name"] = BaseDatabase.TYPES.STRING;
        columns["moderators"] = BaseDatabase.TYPES.MY_JSON;
        columns["allowEverySenderWithoutHold"] = BaseDatabase.TYPES.BOOLEAN;
        columns["allowWithoutHold"] = BaseDatabase.TYPES.MY_JSON;
        return columns;
    }

    // static getRelationDefinitions(){
    //     let relations = super.getRelationDefinitions();
    //     return relations;
    // }
}

// BaseDatabase.addModel(MailingList);