import {MenuSite} from "cordova-sites";

import view from "../../html/Site/selectListSite.html"
import {MenuAction} from "cordova-sites/dist/client/js/Context/Menu/MenuAction/MenuAction";
import {EditPersonSite} from "./EditPersonSite";
import * as Tabulator from "tabulator-tables";
import {DateHelper} from "js-helper/dist/shared/DateHelper";
import {Person} from "../../../shared/model/Person";
import {DataManager} from "cordova-sites/dist/client/js/DataManager";
import {MailingList} from "../../../shared/model/MailingList";
import {SyncJob} from "cordova-sites-easy-sync/dist/client/SyncJob";
import {EditListSite} from "./EditListSite";
import {Toast} from "cordova-sites/dist/client/js/Toast/Toast";

export class SelectListSite extends MenuSite {
    constructor(siteManager) {
        super(siteManager, view);
        this._table = null;
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

    onViewLoaded() {
        let res = super.onViewLoaded();

        this._view.classList.add("select-list-site")

        this._listTableElem = this.findBy("#list-table");

        this._table = new Tabulator(this._listTableElem, {
            height: "100%", // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
            // layout: "fitColumns", //fit columns to width of table (optional)
            columns: [ //Define Table Columns
                {
                    title: "Name",
                    field: "name",
                    headerFilter: true,
                    headerFilterPlaceholder: "..."
                },
                {title: "Moderators", field: "moderators", headerFilter: true, headerFilterPlaceholder: "..."},
            ],
            ajaxParams: {
                "queries": JSON.stringify([{
                    model: MailingList.getSchemaName(),
                }]),
            },
            ajaxURL: DataManager.basePath(SyncJob.SYNC_PATH_PREFIX),
            ajaxProgressiveLoad: "scroll",
            ajaxProgressiveLoadScrollMargin: 350,
            ajaxSorting: true,
            ajaxFiltering: true,
            ajaxRequestFunc: async (url, config, params) => {
                let orderBy = {
                    "name": "ASC",
                    "moderators": "ASC",
                }

                if (params.sorters && params.sorters.length > 0) {
                    orderBy = {};
                    params.sorters.forEach(s => orderBy[s.field] = s.dir.toUpperCase());
                }

                let filter = {};
                if (params.filters && params.filters.length > 0) {
                    params.filters.forEach(f => {
                        if (f.type === "like") {
                            filter[f.field] = {
                                type: "like",
                                value: "%" + f.value + "%"
                            }
                        }
                    })
                }

                let modelJson = await DataManager.load(SyncJob.SYNC_PATH_PREFIX +
                    DataManager.buildQuery({
                        "queries": JSON.stringify([{
                            model: MailingList.getSchemaName(),
                            where: filter,
                            orderBy: orderBy
                        }]),
                        "offset": (params.page - 1) * 50
                    })
                );
                console.log("data", modelJson);
                return {last_page: (modelJson.nextOffset / 50) + 1, data: modelJson.results[0].entities};
            },
            rowClick: async (e, row) => { //trigger an alert message when the row is clicked
                let id = row._row.data.id;
                let res = await this.startSite(EditListSite, {id: id});
                this._table.updateOrAddData([res]);
                new Toast("modified entry").show();
            },
        })

        window.addEventListener("resize", () => {
            this._updateTableHeight();
        })

        return res;
    }

    onStart(pauseArguments) {
        let res = super.onStart(pauseArguments);
        this._updateTableHeight();
        return res;
    }

    _updateTableHeight() {
        // let height = parseInt(window.getComputedStyle(this._personTableElem.parentElement).getPropertyValue("height"));
        // this._personTableElem.style.height = (height-1)+"px";
    }
}