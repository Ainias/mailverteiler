import {MailingList} from "../../../../shared/model/MailingList";
import {SyncController} from "cordova-sites-user-management/dist/server/v1/controller/SyncController";
import {MailmanApi} from "../MailmanApi";
import {Person} from "../../../../shared/model/Person";

export class ListController extends SyncController {
    static async modifyList(req, res) {
        let modelName = req.body.model;
        let modelData = req.body.values;

        //TODO check rights
        if (modelName !== MailingList.getSchemaName()) {
            throw new Error("tried to modify other model than MailingList via specific controller!")
        }

        let mailingList: any = await this._doModifyModel(MailingList, modelData);

        //TODO change domain
        const domain = "smdac.uber.space"
        let fqdm = (mailingList.name + "@" + domain).toLowerCase();

        let api = MailmanApi.getInstance();
        let listData: any = await api.getLists(fqdm);

        if (listData.title && listData.title === "404 Not Found") {
            listData = await api.addList(fqdm);
        }

        // let listData = await api.addList(fqdm)
        // debugger;

        //TODO Set ListData

        return res.json(mailingList);
    }

    static async modifyPerson(req, res) {
        let modelName = req.body.model;
        let modelData = req.body.values;

        //TODO check rights
        if (modelName !== Person.getSchemaName()) {
            throw new Error("tried to modify other model than Person via specific controller!")
        }

        let modelId = modelData.id;
        if (modelId) {
            let personBefore = await Person.findById(modelId);
        }

        let person: any = await this._doModifyModel(Person, modelData);

        //TODO change domain


        //TODO change mail
        let mail = person.email;

        let api = MailmanApi.getInstance();
        let personData: any = await api.getUsers(mail);

        if (personData.title && personData.title === "404 Not Found") {
            personData = await api.createUser(mail);
        }

        //TODO Set ListData

        return res.json(person);
    }
}