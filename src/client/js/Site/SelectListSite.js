import {MenuSite} from "cordova-sites";

import view from "../../html/Site/selectListSite.html"
import {MenuAction} from "cordova-sites/dist/client/js/Context/Menu/MenuAction/MenuAction";
import * as Tabulator from "tabulator-tables";
import {DataManager} from "cordova-sites/dist/client/js/DataManager";
import {EditListSite} from "./EditListSite";
import {Toast} from "cordova-sites/dist/client/js/Toast/Toast";
import {App} from "cordova-sites/dist/client/js/App";
import {Helper} from "js-helper/dist/shared/Helper";
import {ConfirmDialog} from "cordova-sites/dist/client/js/Dialog/ConfirmDialog";
import {RIGHTS} from "../../../shared/RIGHTS";
import {UserSite} from "cordova-sites-user-management/dist/client/js/Context/UserSite";

export class SelectListSite extends MenuSite {
    constructor(siteManager) {
        super(siteManager, view);
        this._table = null;

        this.addDelegate(new UserSite(this, RIGHTS.VIEW_LIST, false));
    }

    onCreateMenu(navbar) {
        navbar.addAction(new MenuAction("new entry", async () => {
            let res = await this.startSite(EditListSite);
            if (this._table) {
                this._table.updateOrAddData([res]);
            }
            new Toast("added entry").show();
        }));
        return navbar;
    }

    async deleteLists(rows){
        if (await new ConfirmDialog("Are you sure to delete these lists? They will be gone forever! (That's a long time!)", "Delete selected lists?").show()) {
            this.showLoadingSymbol();
            await DataManager.send("deleteLists", {lists: rows.map(r => r.getData().list_id)});
            rows.forEach(r => r.delete());
            this.removeLoadingSymbol();
            return true;
        }
        return false;
    }

    async onViewLoaded() {
        let res = super.onViewLoaded();

        this._view.classList.add("select-list-site")

        this._listTableElem = this.findBy("#list-table");

        this._table = new Tabulator(this._listTableElem, {
            height: "100%", // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
            // layout: "fitColumns", //fit columns to width of table (optional)
            index: "list_id",
            selectable: true,
            columns: [ //Define Table Columns
                {
                    title: "Name",
                    field: "display_name",
                    headerFilter: true,
                    headerFilterPlaceholder: "..."
                },
                {
                    title: "Address",
                    field: "fqdn_listname",
                    headerFilter: true,
                    headerFilterPlaceholder: "..."
                },
                {title: "Description", field: "description", headerFilter: true, headerFilterPlaceholder: "..."},
                {title: "Members", field: "member_count", headerFilter: true, headerFilterPlaceholder: "..."},
            ],
            ajaxURL: DataManager.basePath("/lists"),
            ajaxProgressiveLoad: "scroll",
            ajaxProgressiveLoadScrollMargin: 350,
            // ajaxSorting: true,
            // ajaxFiltering: true,
            ajaxRequestFunc: async (url, config, params) => {
                let modelJson = await DataManager.load("/lists" +
                    DataManager.buildQuery({
                        "page": params.page,
                        "count": 50,
                    })
                );
                let data = Helper.nonNull(modelJson.entries, []);
                return {last_page: (modelJson.total_size / 50) + 1, data: data};
            },
            rowDblClick: async (e, row) => { //trigger an alert message when the row is clicked
                let id = row._row.data.list_id;
                let res = await this.startSite(EditListSite, {id: id});
                this._table.updateOrAddData([res]);
                new Toast("modified entry").show();
            },
            rowContextMenu: [{
                "label":"delete",
                "action":async (e, row) => {
                    let rows = this._table.getSelectedRows();
                    if (rows.length === 0){
                        rows = [row];
                    }
                    await this.deleteLists(rows);
                }
            }]
        })

        // window.addEventListener("resize", () => {
        //     this._updateTableHeight();
        // })

        return res;
    }
}

App.addInitialization((app) => {
    app.addDeepLink("lists", SelectListSite);
})