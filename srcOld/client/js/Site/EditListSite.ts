import {Helper} from "js-helper";

const view = require("../../html/Site/editListsSite.html");
import {DataManager} from "cordova-sites/dist/client/js/DataManager";
import {MenuSite} from "cordova-sites/dist/client/js/Context/MenuSite";
import {App, Form, Toast} from "cordova-sites";
import {SelectPersonFragment} from "../Fragment/SelectPersonFragment";
import {JsonHelper} from "js-helper/dist/shared/JsonHelper";
import {RIGHTS} from "../../../shared/RIGHTS";
import {UserSite} from "cordova-sites-user-management/dist/client/js/Context/UserSite";

export class EditListSite extends MenuSite {
    private list: any;
    private readonly ownerFragment: SelectPersonFragment;
    private readonly memberFragment: SelectPersonFragment;
    private readonly personFragment: SelectPersonFragment;

    constructor(siteManager) {
        super(siteManager, view);
        this.ownerFragment = new SelectPersonFragment(this);
        this.memberFragment = new SelectPersonFragment(this);
        this.personFragment = new SelectPersonFragment(this);

        this.addFragment("#owner-section", this.ownerFragment);
        this.addFragment("#member-section", this.memberFragment);
        this.addFragment("#persons-section", this.personFragment);

        this.addDelegate(new UserSite(this, RIGHTS.EDIT_LIST, false));
    }

    async onConstruct(constructParameters) {
        let res = super.onConstruct(constructParameters);

        if (constructParameters["id"]) {
            let lists = await DataManager.load("lists" + DataManager.buildQuery({listname: constructParameters["id"]}));
            if (lists) {
                this.list = lists;
            }
        }
        if (!this.list) {
            this.list = {};
        }

        this.ownerFragment.setMemberFilter("moderator", this.list.list_id);
        this.memberFragment.setMemberFilter("member", this.list.list_id);
        this.personFragment.setMemberFilter(false, this.list.list_id);

        const ownerAction = {
            "label": "Add Moderator",
            "action": async (e, row) => {
                await this.addMember(row, "moderator")
            }
        }
        const memberAction = {
            "label": "Add Member",
            "action": async (e, row) => {
                await this.addMember(row, "member")
            }
        }
        const leaveOwnerAction = {
            "label": "Delete Moderator",
            "action": async (e, row) => {
                await this.leaveList(row, "moderator")
            }
        }
        const leaveMemberAction = {
            "label": "Delete Member",
            "action": async (e, row) => {
                await this.leaveList(row, "member")
            }
        }

        this.personFragment.addRowContextAction(memberAction)
        this.personFragment.addRowContextAction(ownerAction)

        this.memberFragment.addRowContextAction(ownerAction);
        this.memberFragment.addRowContextAction(leaveMemberAction);

        this.ownerFragment.addRowContextAction(leaveOwnerAction);

        return res;
    }

    async addMember(row, role) {
        this.showLoadingSymbol();

        let rows = row.getTable().getSelectedRows();
        if (rows.length === 0) {
            rows = [row];
        }

        await Helper.asyncForEach(rows, async row => {
            let res = await DataManager.send("/addMember", {
                "role": role,
                "list_id": this.list.list_id,
                "subscriber": row.getData().mailmanId,
                "subscriberMail": row.getData().email,
            });
            if (res.member_id) {
                let data = row.getData();
                if (role === "member") {
                    row.delete();
                }
                if (role === "member") {
                    this.memberFragment.addData([data]);
                } else {
                    this.ownerFragment.addData([data]);
                }
            }
        }, true);
        this.removeLoadingSymbol();
    }

    async leaveList(row, role) {
        this.showLoadingSymbol();

        let rows = row.getTable().getSelectedRows();
        if (rows.length === 0) {
            rows = [row];
        }

        await Helper.asyncForEach(rows, async row => {
            let res = await DataManager.send("/leaveList", {
                "role": role,
                "list_id": this.list.list_id,
                "subscriberMail": row.getData().email
            })
            if (JsonHelper.deepEqual({}, res)) {
                let data = row.getData();
                row.delete();
                if (role === "member") {
                    this.personFragment.addData([data]);
                }
            }
        });
        this.removeLoadingSymbol();
    }

    async onViewLoaded() {
        let res = super.onViewLoaded();

        let form = new Form(this.findBy("#list-form"), async values => {
            this.list["description"] = values["description"];
            this.list["display_name"] = values["display_name"];
            this.list["subject_prefix"] = values["subject_prefix"];
            if (values["pw"]) {
                this.list["pw"] = values["pw"];
            }
            this.list["default_member_action"] = values["default_member_action"];
            this.list["default_nonmember_action"] = values["default_nonmember_action"];

            let res = await DataManager.send("list", this.list);
            if (res.title && res.title.startsWith("400") && res.description) {
                new Toast(res.description, Toast.DEFAULT_DURATION, false).show();
            } else {
                await this.finish(res);
            }
        });

        if (this.list.pw){
            this.list.pw = "******";
        }
        else {
            delete this.list.pw;
        }

        await form.setValues(this.list);

        this.findBy(".delete-password-button").addEventListener("click", async (e) => {
            e.preventDefault();
            e.stopPropagation();

            this.showLoadingSymbol();
            const res = await DataManager.send("deletePassword", {list_id: this.list.list_id});
            if (res){
                form.setValues({"pw":""});
            }
            this.removeLoadingSymbol();
        })

        return res;
    }
}

App.addInitialization(app => {
    app.addDeepLink("editList", EditListSite);
})