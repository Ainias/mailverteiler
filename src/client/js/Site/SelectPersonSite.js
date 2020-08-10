import {MenuSite} from "cordova-sites/dist/client/js/Context/MenuSite";

import view from "../../html/Site/selectPersonSite.html"
import {EditPersonSite} from "./EditPersonSite";
import {MenuAction} from "cordova-sites/dist/client/js/Context/Menu/MenuAction/MenuAction";
import {StartSiteMenuAction} from "cordova-sites/dist/client/js/Context/Menu/MenuAction/StartSiteMenuAction";
import {SelectListSite} from "./SelectListSite";
import {Toast} from "cordova-sites/dist/client/js/Toast/Toast";
import {SelectPersonFragment} from "../Fragment/SelectPersonFragment";
import {ConfirmDialog} from "cordova-sites/dist/client/js/Dialog/ConfirmDialog";
import {DataManager} from "cordova-sites/dist/client/js/DataManager";

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

        fragment.addRowContextAction({
            "label": "Delete",
            "action": async (e, row) => {
                let rows = row.getTable().getSelectedRows();
                if (rows.length === 0) {
                    rows = [row];
                }
                if (await this.deletePersons(rows.map(r => r.getData()))) {
                    rows.forEach(r => r.delete());
                }
            }
        })

        this._fragment = fragment;
    }

    async deletePersons(persons) {
        if (await new ConfirmDialog("Are you sure to delete these persons? They will be gone forever! (That's a long time!)", "Delete selected persons?").show()) {
            this.showLoadingSymbol();
            await DataManager.send("deletePersons", {personIds: persons.map(p => p.id)});
            this.removeLoadingSymbol();
            return true;
        }
        return false;
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