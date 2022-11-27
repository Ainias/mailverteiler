import {MenuSite} from "cordova-sites/dist/client/js/Context/MenuSite";

const view = require("../../html/Site/checkMailSite.html")
import {App} from "cordova-sites/dist/client/js/App";
import {DataManager} from "cordova-sites/dist/client/js/DataManager";
import {Form} from "cordova-sites/dist/client/js/Form";
import {JsonHelper} from "js-helper/dist/shared/JsonHelper";
import {Toast} from "cordova-sites/dist/client/js/Toast/Toast";
import {ViewHelper} from "js-helper/dist/client/ViewHelper";
import {Translator} from "cordova-sites";
import {RejectReasonDialog} from "../Dialog/RejectReasonDialog";

export class CheckMailSite extends MenuSite {
    private _list: any;
    private _emailContainer: HTMLElement;
    private _emailTemplate: HTMLElement;
    private _passwordSection: HTMLElement;
    private _emailSection: HTMLElement;
    private _pw: string;

    constructor(siteManager) {
        super(siteManager, view);
    }

    async onConstruct(constructParameters) {
        let res = super.onConstruct(constructParameters);
        this._list = constructParameters["list"];
        return res;
    }

    onCreateMenu(navbar) {
        navbar.removeAllActions();
        super.onCreateMenu(navbar);
    }

    onViewLoaded() {
        let res = super.onViewLoaded();

        this._emailContainer = this.findBy("#email-container")
        this._emailTemplate = this.findBy("#email-template");
        this._emailTemplate.removeAttribute("id");
        this._emailTemplate.remove();

        this._passwordSection = this.findBy("#password-section");
        this._emailSection = this.findBy("#email-section");

        new Form(this.findBy("#password-form"), async values => {
            this._pw = values["password"];
            let mails = await DataManager.send("mails", {list: this._list, pw: this._pw});
            if (!JsonHelper.deepEqual(mails, {})) {
                this.setEmails(mails);
            } else {
                await new Toast("wrong password!").show();
            }
        });

        return res;
    }

    setEmails(mails) {
        this._passwordSection.classList.add("hidden");
        this._emailSection.classList.remove("hidden");

        ViewHelper.removeAllChildren(this._emailContainer);
        if (mails.entries) {
            mails.entries.forEach(mail => {
                const mailElem = this._emailTemplate.cloneNode(true) as HTMLElement;
                (<HTMLElement>mailElem.querySelector(".email-text")).innerText = CheckMailSite._prepareMailText(mail.msg);
                mailElem.querySelectorAll(".button").forEach(button => {
                    button.addEventListener("click", async (e) => {
                        this.showLoadingSymbol();

                        const action = (<HTMLElement>e.target).dataset["action"];
                        let reason: any = "";
                        if (action === "reject") {
                            reason = await new RejectReasonDialog().show();
                            console.log("reason", reason);
                        }
                        if (reason === null){
                            this.removeLoadingSymbol();
                            return;
                        }

                        let res = await DataManager.send("handleMail", {
                            list: this._list,
                            pw: this._pw,
                            request: mail.request_id,
                            action: action,
                            reason: reason,
                        })
                        this.removeLoadingSymbol();
                        if (res && res.success && res.success === true) {
                            mailElem.remove();
                        } else {
                            new Toast("there was an error: " + JSON.stringify(res)).show();
                        }
                    })
                })
                this._emailContainer.appendChild(mailElem);
            })
            Translator.getInstance().updateTranslations(this._emailContainer);
        }
    }

    static _prepareMailText(msg) {
        let headerLength = msg.indexOf("\n\n");
        let headers = msg.substring(0, headerLength).split("\n");
        let body = msg.substring(headerLength + 2);

        const allowedHeaders = [
            "to", "from", "date", "subject"
        ]

        headers = headers.filter(h => {
            let headerName = h.split(":")[0].toLowerCase();
            return allowedHeaders.indexOf(headerName) !== -1;
        });
        return headers.join("\n") + "\n\n" + body;
    }
}

App.addInitialization(app => {
    app.addDeepLink("checkMail", CheckMailSite);
});
