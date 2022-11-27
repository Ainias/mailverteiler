import {Dialog, ViewInflater} from "cordova-sites";

const view = require("../../html/Dialog/rejectReasonDialog.html")

export class RejectReasonDialog extends Dialog {

    constructor() {
        super(ViewInflater.getInstance().load(view).then(view => {
            view.querySelector(".reject-button").addEventListener("click", () => {
                this._result = view.querySelector(".reject-reason").value;
                this.close();
            })
            return view;
        }), "Reject Reason");
    }
}