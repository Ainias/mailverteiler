import {ModifyEntitySite} from "cordova-sites-easy-sync/dist/client/editEntitySite/ModifyEntitySite";

import view from "../../html/Site/editPersonSite.html"
import {Person} from "../../../shared/model/Person";
import {Helper} from "js-helper/dist/shared/Helper";
import {DataManager} from "cordova-sites/dist/client/js/DataManager";
import {SyncJob} from "cordova-sites-easy-sync/dist/client/SyncJob";

export class EditPersonSite extends ModifyEntitySite{

    constructor(siteManager) {
        super(siteManager, view, Person);
    }


    async getEntityFromParameters(constructParameters) {
        let entity = null;
        if (Helper.isSet(constructParameters, "id")) {
            let modelJson = await DataManager.load(SyncJob.SYNC_PATH_PREFIX +
                DataManager.buildQuery({
                    "queries": JSON.stringify([{
                        model: Person.getSchemaName(),
                        where: {id: constructParameters["id"]},
                    }]),
                })
            );

            let persons = await Person._fromJson(modelJson.results[0].entities);
            if (persons.length === 1){
                entity = persons[0];
            }
        }

        if (Helper.isNull(entity)) {
            entity = new Person();
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