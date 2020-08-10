import {MenuSite} from "cordova-sites/dist/client/js/Context/MenuSite";

import view from "../../html/Site/selectPersonSite.html"
import {EditPersonSite} from "./EditPersonSite";
import {MenuAction} from "cordova-sites/dist/client/js/Context/Menu/MenuAction/MenuAction";
import {StartSiteMenuAction} from "cordova-sites/dist/client/js/Context/Menu/MenuAction/StartSiteMenuAction";
import {SelectListSite} from "./SelectListSite";
import {Toast} from "cordova-sites/dist/client/js/Toast/Toast";
import {SelectPersonFragment} from "../Fragment/SelectPersonFragment";

export class SelectPersonSite extends MenuSite {
    constructor(siteManager) {
        super(siteManager, view);
        let fragment = new SelectPersonFragment(this);
        this.addFragment("#person-list-fragment", fragment);
        fragment.setOnRowClickedListener(async (e, row) => {
            let id = row._row.data.id;
            let res = await this.startSite(EditPersonSite, {id: id});
            fragment.addData([res]);
            new Toast("modified entry").show();
        })
        this._fragment = fragment;
    }

    onViewLoaded() {
        let res = super.onViewLoaded();
        this._view.classList.add("select-person-site")
        return res;
    }

    onCreateMenu(navbar) {
        navbar.addAction(new MenuAction("new entry", async () => {
            let res = await this.startSite(EditPersonSite);
            if (this._table) {
                this._fragment.addData([res]);
            }
            new Toast("added entry").show();
        }));
        navbar.addAction(new StartSiteMenuAction("lists", SelectListSite));
        return navbar;
    }
}