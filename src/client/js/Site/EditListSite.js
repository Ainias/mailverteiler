import view from "../../html/Site/editListsSite.html";
import {DataManager} from "cordova-sites/dist/client/js/DataManager";
import {MenuSite} from "cordova-sites/dist/client/js/Context/MenuSite";
import {Form} from "cordova-sites";
import {SelectPersonFragment} from "../Fragment/SelectPersonFragment";
import {JsonHelper} from "js-helper/dist/shared/JsonHelper";

export class EditListSite extends MenuSite {
    constructor(siteManager) {
        super(siteManager, view);
        this._ownerFragment = new SelectPersonFragment(this);
        this._memberFragment = new SelectPersonFragment(this);
        this._personFragment = new SelectPersonFragment(this);

        this.addFragment("#owner-section", this._ownerFragment);
        this.addFragment("#member-section", this._memberFragment);
        this.addFragment("#persons-section", this._personFragment);
    }

    async onConstruct(constructParameters) {
        let res = super.onConstruct(constructParameters);

        if (constructParameters["id"]) {
            let lists = await DataManager.load("lists" + DataManager.buildQuery({listname: constructParameters["id"]}));
            if (lists) {
                this._list = lists;
            }
        }
        if (!this._list) {
            this._list = {};
        }

        this._ownerFragment.setMemberFilter("moderator", this._list.list_id);
        this._memberFragment.setMemberFilter("member", this._list.list_id);
        this._personFragment.setMemberFilter(false, this._list.list_id);

        let ownerAction = {
            "label": "Add Moderator",
            "action": async (e, row) => {
                await this.addMember(row, "moderator")
            }
        }
        let memberAction = {
            "label": "Add Member",
            "action": async (e, row) => {
                await this.addMember(row, "member")
            }
        }
        let leaveOwnerAction = {
            "label": "Delete Moderator",
            "action": async (e, row) => {
                await this.leaveList(row, "moderator")
            }
        }
        let leaveMemberAction = {
            "label": "Delete Member",
            "action": async (e, row) => {
                await this.leaveList(row, "member")
            }
        }

        this._personFragment.addRowContextAction(memberAction)
        this._personFragment.addRowContextAction(ownerAction)

        this._memberFragment.addRowContextAction(ownerAction);
        this._memberFragment.addRowContextAction(leaveMemberAction);

        this._ownerFragment.addRowContextAction(leaveOwnerAction);

        return res;
    }

    async addMember(row, role) {
        this.showLoadingSymbol();
        let res = await DataManager.send("/addMember", {
            "role": role,
            "list_id": this._list.list_id,
            "subscriber": row.getData().mailmanId,
            "subscriberMail": row.getData().email,
        });
        if (res.member_id){
            let data = row.getData();
            row.delete();
            if (role === "member"){
                this._memberFragment.addData([data]);
            }
            else {
                this._ownerFragment.addData([data]);
            }
        }
        this.removeLoadingSymbol();
    }

    async leaveList(row, role) {
        this.showLoadingSymbol();
        let res = await DataManager.send("/leaveList", {
            "role": role,
            "list_id": this._list.list_id,
            "subscriberMail": row.getData().email
        })
        if (JsonHelper.deepEqual({}, res)){
            let data = row.getData();
            row.delete();
            this._personFragment.addData([data]);
        }
        this.removeLoadingSymbol();
    }

    async onViewLoaded() {
        let res = super.onViewLoaded();

        let form = new Form(this.findBy("#list-form"), async values => {

            this._list["description"] = values["description"];
            this._list["display_name"] = values["display_name"];
            this._list["subject_prefix"] = values["subject_prefix"];

            let res = await DataManager.send("list", this._list);
            console.log("done", res);
            await this.finish(res);
        });
        await form.setValues(this._list);

        return res;
    }
}