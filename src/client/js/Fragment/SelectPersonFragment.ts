import {AbstractFragment} from "cordova-sites/dist/client/js/Context/AbstractFragment";

const view = require("../../html/Fragment/selectPersonFragment.html");
import * as Tabulator from "tabulator-tables";
import {DateHelper} from "js-helper/dist/shared/DateHelper";
import {Person} from "../../../shared/model/Person";
import {DataManager} from "cordova-sites/dist/client/js/DataManager";
import {SyncJob} from "cordova-sites-easy-sync/dist/client/SyncJob";
import {Helper} from "js-helper/dist/shared/Helper";

export class SelectPersonFragment extends AbstractFragment {

    private _table: any;
    private _onRowClickedListener: any;
    private readonly _rowContextActions: any[];
    private _memberFilter: any;
    private _list: any;
    private _personTableElem: any;
    private lists: any[];

    constructor(site, lists?) {
        super(site, view);
        this._table = null;
        this._onRowClickedListener = null;
        this._rowContextActions = [];
        this.lists = lists;
    }

    setMemberFilter(filter, list) {
        this._memberFilter = filter;
        this._list = list;
    }

    addRowContextAction(action) {
        this._rowContextActions.push(action);
    }

    async onViewLoaded() {
        let res = super.onViewLoaded();

        if (Helper.isNull(this.lists)) {
            this.lists = await DataManager.load("lists")
        }

        this._personTableElem = this.findBy(".person-table");

        const columns = [ //Define Table Columns
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
        ];

        if (this.lists && Array.isArray(this.lists.entries)) {
            // @ts-ignore
            this.lists.entries.forEach(entry => {

                const field = "list-"+entry.list_id;
                const column: any = {
                    title: entry.list_name,
                    field: field,
                    headerFilter: "tickCross",
                    headerSort: false,
                    headerFilterParams: {
                        tristate: true
                    },
                    formatter: (cell) => {
                        const val = cell.getRow().getData()[field];
                        if (val=== true){
                            return "<input type = 'checkbox' disabled checked>"
                        }
                        else if (val === false){
                            return "<input type = 'checkbox' disabled>"
                        }
                        return "";
                    },
                };

                columns.push(column);
            });
        }
        console.log("columns", columns);

        this._table = new Tabulator(this._personTableElem, {
            height: "100%", // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
            selectable: true,
            columns: columns,
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
                // this.getSite().showLoadingSymbol();
                let orderBy: any = {
                    "firstname": "ASC",
                    "surname": "ASC",
                    "email": "ASC"
                }

                if (params.sorters && params.sorters.length > 0) {
                    orderBy = {};
                    params.sorters.forEach(s => orderBy[s.field] = s.dir.toUpperCase());
                }

                let memberships = {};
                let filter = {};
                if (params.filters && params.filters.length > 0) {
                    params.filters.forEach((f, i) => {
                        if (f.field.startsWith("list-")){
                            memberships[f.field.substring(5)] = f.value;
                        }
                        else if (f.type === "like") {
                            filter[f.field] = {
                                type: "like",
                                value: "%" + f.value + "%"
                            }
                        }
                    })
                }

                let query: any = {
                    model: Person.getSchemaName(),
                    where: filter,
                    memberships: memberships,
                    orderBy: orderBy
                };
                if (Helper.isNotNull(this._memberFilter)) {
                    query.member = this._memberFilter;
                    query.list = this._list;
                }

                let modelJson = await DataManager.load("/persons" +
                    DataManager.buildQuery({
                        "queries": JSON.stringify([query]),
                        "offset": (params.page - 1) * 50
                    })
                );
                console.log(modelJson.results[0].entities);
                return {last_page: Math.floor(modelJson.nextOffset / 50) + 1, data: modelJson.results[0].entities};
            },
            rowDblClick: async (e, row) => { //trigger an alert message when the row is clicked
                if (typeof this._onRowClickedListener === "function") {
                    await this._onRowClickedListener(e, row, this._table);
                }
            },
            // rowContext: async (e, row) => {
            //     if (typeof this._onRowContextMenuListener === "function"){
            //         await this._onRowContextMenuListener(e, row);
            //     }
            // }
            rowContextMenu: this._rowContextActions,
        })

        window.addEventListener("resize", () => {
            this._updateTableHeight();
        })

        return res;
    }

    addData(data) {
        this._table.updateOrAddData(data);
    }

    setOnRowClickedListener(listener) {
        this._onRowClickedListener = listener;
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