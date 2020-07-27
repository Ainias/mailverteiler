import {ModifyEntitySite} from "cordova-sites-easy-sync/dist/client/editEntitySite/ModifyEntitySite";
import view from "../../html/Site/editListsSite.html";
import {Person} from "../../../shared/model/Person";
import {Helper} from "js-helper/dist/shared/Helper";
import {DataManager} from "cordova-sites/dist/client/js/DataManager";
import {SyncJob} from "cordova-sites-easy-sync/dist/client/SyncJob";
import {MailingList} from "../../../shared/model/MailingList";

export class EditListSite extends ModifyEntitySite{
    constructor(siteManager) {
        super(siteManager, view, MailingList);
    }

    async getEntityFromParameters(constructParameters) {
        let entity = null;
        if (Helper.isSet(constructParameters, "id")) {
            let modelJson = await DataManager.load(SyncJob.SYNC_PATH_PREFIX +
                DataManager.buildQuery({
                    "queries": JSON.stringify([{
                        model: MailingList.getSchemaName(),
                        where: {id: constructParameters["id"]},
                    }]),
                })
            );

            let mailingLists = await MailingList._fromJson(modelJson.results[0].entities);
            if (mailingLists.length === 1){
                entity = mailingLists[0];
            }
        }

        if (Helper.isNull(entity)) {
            entity = new MailingList();
        }
        return entity;
    }

    saveListener() {
        let values = this.dehydrate(this._entity);
        this.finish(values);
    }

    async validate(values, form) {
        //TODO real validator
        return super.validate(values, form); //return only true
    }
}