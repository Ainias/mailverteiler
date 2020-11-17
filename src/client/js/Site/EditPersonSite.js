import {ModifyEntitySite} from "cordova-sites-easy-sync/dist/client/editEntitySite/ModifyEntitySite";

import view from "../../html/Site/editPersonSite.html"
import {Person} from "../../../shared/model/Person";
import {Helper} from "js-helper/dist/shared/Helper";
import {DataManager} from "cordova-sites/dist/client/js/DataManager";
import {SyncJob} from "cordova-sites-easy-sync/dist/client/SyncJob";
import {ViewHelper} from "js-helper/dist/client/ViewHelper";
import {RIGHTS} from "../../../shared/RIGHTS";
import {UserSite} from "cordova-sites-user-management/dist/client/js/Context/UserSite";
import {App} from "cordova-sites/dist/client/js/App";
import {CheckMailSite} from "./CheckMailSite";
import {DateHelper} from "js-helper";

export class EditPersonSite extends ModifyEntitySite {

    constructor(siteManager) {
        super(siteManager, view, Person);
        this.addDelegate(new UserSite(this, RIGHTS.EDIT_USER, false));
    }

    async onViewLoaded() {
        let res = super.onViewLoaded();

        this._membershipContainer = this.findBy("#membership-container");
        this._membershipTemplate = this.findBy("#membership-template");

        this._membershipTemplate.removeAttribute("id");
        this._membershipTemplate.remove();

        await this.addMembershipSelections();

        return res;
    }

    async addMembershipSelections() {
        let lists = await DataManager.load("lists");

        ViewHelper.removeAllChildren(this._membershipContainer);
        if (lists && lists.entries) {
            lists.entries.forEach(entry => {
                let elem = this._membershipTemplate.cloneNode(true);
                elem.querySelector(".membership-name").innerText = entry.list_name;
                elem.querySelector(".membership-checkbox").name = "list-" + entry.list_id;

                this._membershipContainer.appendChild(elem);
            });
        }
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
            if (persons.length === 1) {
                entity = persons[0];
            }
        }

        if (Helper.isNull(entity)) {
            entity = new Person();
        }

        this._memberships = await DataManager.load("memberships" + DataManager.buildQuery({"email": entity.email}));

        return entity;
    }

    async save(values) {
        await this.hydrate(values, this._entity);

        let memberships = []
        Object.keys(values).forEach(key => {
            if (key.startsWith("list-")) {
                memberships.push(key.substr(5));
            }
        })

        let personData = this._entity.toJSON()

        let data = {"person": personData, "memberships": memberships};
        let res = await DataManager.send(Person.SAVE_PATH, data);
        if (res.success === false) {
            throw new Error(data.errors);
        }
        // await this._entity.save();
    }

    async dehydrate(entity) {
        let values = await super.dehydrate(entity);
        if (entity.birthday) {
            values["birthday"] = DateHelper.strftime("%Y-%m-%d", new Date(entity.birthday));
        }
        if (this._memberships && this._memberships.entries) {
            this._memberships.entries.forEach(entry => {
                values["list-" + entry.list_id] = "1";
            });
        }
        return values;
    };

    saveListener() {
        let values = this.dehydrate(this._entity);
        this.finish(values);
    }

    async validate(values, form) {
        //TODO real validator
        return super.validate(values, form); //return only true
    }
}

App.addInitialization(app => {
    app.addDeepLink("editPerson", EditPersonSite);
})