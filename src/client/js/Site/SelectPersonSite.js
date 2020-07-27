import {MenuSite} from "cordova-sites/dist/client/js/Context/MenuSite";

import {Person} from "../../../shared/model/Person"

import view from "../../html/Site/selectPersonSite.html"
import {DataManager} from "cordova-sites/dist/client/js/DataManager";
import {SyncJob} from "cordova-sites-easy-sync/dist/client/SyncJob";
import * as Tabulator from "tabulator-tables";
import {DateHelper} from "js-helper/dist/shared/DateHelper";
import {EditPersonSite} from "./EditPersonSite";
import {MenuAction} from "cordova-sites/dist/client/js/Context/Menu/MenuAction/MenuAction";

export class SelectPersonSite extends MenuSite {
    constructor(siteManager) {
        super(siteManager, view);
        this._table = null;
    }

    onCreateMenu(navbar) {
        navbar.addAction(new MenuAction("new entry", async () => {
            let res = await this.startSite(EditPersonSite);
            if (this._table) {
                this._table.updateOrAddData([res]);
            }
            new Toast("added entry").show();
        }));
        return navbar;
    }

    onViewLoaded() {
        let res = super.onViewLoaded();

        this._view.classList.add("select-person-site")

        this._personTableElem = this.findBy("#person-table");

        this._table = new Tabulator(this._personTableElem, {
            height: "100%", // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
            // layout: "fitColumns", //fit columns to width of table (optional)
            columns: [ //Define Table Columns
                {
                    title: "Vorname",
                    field: "firstname",
                    headerFilter: true,
                    frozen: true,
                    headerFilterPlaceholder: "..."
                },
                {title: "Nachname", field: "surname", headerFilter: true, frozen: true, headerFilterPlaceholder: "..."},
                {title: "E-Mail", field: "email", headerFilter: true, headerFilterPlaceholder: "..."},
                {title: "Straße", field: "street", headerFilter: true, headerFilterPlaceholder: "..."},
                {title: "Hausnr.", field: "housenumber", headerFilter: true, headerFilterPlaceholder: "..."},
                {title: "Adr.-Zusatz", field: "addressSuffix", headerFilter: true, headerFilterPlaceholder: "..."},
                {title: "PLZ", field: "zipcode", headerFilter: true, headerFilterPlaceholder: "..."},
                {title: "Stadt", field: "city", headerFilter: true, headerFilterPlaceholder: "..."},
                {title: "Land", field: "countrycode", headerFilter: true, headerFilterPlaceholder: "..."},
                {
                    title: "Geburtstag",
                    field: "birthday",
                    headerFilter: true,
                    headerFilterPlaceholder: "...",
                    formatter: (cell) => {
                        if (cell.getValue()) {
                            return DateHelper.strftime("%d.%m.%Y", cell.getValue())
                        } else {
                            return "-";
                        }
                    }
                },
                {title: "Kommentar", field: "comment", headerFilter: true, headerFilterPlaceholder: "..."},
                // {title: "Age", field: "age", hozAlign: "left", formatter: "progress"},
                // {title: "Favourite Color", field: "col"},
                // {title: "Date Of Birth", field: "dob", sorter: "date", hozAlign: "center"},
            ],
            ajaxParams: {
                "queries": JSON.stringify([{
                    model: Person.getSchemaName(),
                }]),
            },
            ajaxURL: DataManager.basePath(SyncJob.SYNC_PATH_PREFIX),
            ajaxProgressiveLoad: "scroll",
            ajaxProgressiveLoadScrollMargin: 350,
            ajaxSorting: true,
            ajaxFiltering: true,
            ajaxRequestFunc: async (url, config, params) => {
                let orderBy = {
                    "firstname": "ASC",
                    "surname": "ASC",
                    "email": "ASC"
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
                            model: Person.getSchemaName(),
                            where: filter,
                            orderBy: orderBy
                        }]),
                        "offset": (params.page - 1) * 50
                    })
                );
                return {last_page: (modelJson.nextOffset / 50) + 1, data: modelJson.results[0].entities};
            },
            rowClick: async (e, row) => { //trigger an alert message when the row is clicked
                let id = row._row.data.id;
                let res = await this.startSite(EditPersonSite, {id: id});
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