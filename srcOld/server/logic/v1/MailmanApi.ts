import * as https from "https";
import * as querystring from "querystring";
import {Helper} from "js-helper/dist/shared/Helper";
import * as http from "http";

export class MailmanApi {
    private readonly _rootUrl: string;
    private readonly _username: string;
    private readonly _password: string;

    private static _instance: MailmanApi;

    constructor(rootUrl: string, username: string, password: string) {
        this._rootUrl = rootUrl;
        this._username = username;
        this._password = password;
    }

    static getInstance() {
        return this._instance;
    }

    static init(rootUrl: string, username: string, password: string) {
        this._instance = new MailmanApi(rootUrl, username, password);
    }

    private async _fetch(path): Promise<any> {
        return new Promise((resolve, reject) => {
            let url = new URL(this._rootUrl + path);
            let options = {
                host: url.hostname,
                port: url.port,
                path: url.pathname,
                auth: this._username + ":" + this._password,
            }

            let req = (url.protocol === "http:" ? http:https).get(options, res => {
                res.setEncoding("utf8");
                let body = "";
                res.on("data", data => {
                    body += data;
                });
                res.on("end", () => {
                    try {
                        if (body === "") {
                            resolve();
                        } else {
                            resolve(JSON.parse(body));
                        }
                    } catch (e) {
                        console.error("JSON-PARSE-ERROR: ", url.toString(), body)
                        reject(e);
                    }
                });
            });
            req.on("error", (e) => {
                debugger;
                reject(e);
            });
        });
    }

    private async _send(path, data?, method?) {
        if (!data) {
            return this._fetch(path);
        }

        method = Helper.nonNull(method, "post");

        return new Promise((resolve, reject) => {
            data = querystring.stringify(data || {});

            let url = new URL(this._rootUrl + path);
            let options = {
                host: url.hostname,
                port: url.port,
                path: url.pathname,
                auth: this._username + ":" + this._password,
                method: method,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(data)
                }
            }

            const req = (url.protocol === "http:" ? http:https).request(options, res => {
                // console.log(res.statusCode);
                let body = "";
                res.on("data", data => {
                    body += data;
                });
                res.on("end", () => {
                    try {
                        if (body === "") {
                            resolve();
                        } else {
                            resolve(JSON.parse(body));
                        }
                    } catch (e) {
                        console.error("JSON-PARSE-ERROR: ", url.toString(), body)
                        reject(e);
                    }
                });
            });
            req.on("error", (e) => {
                reject(e);
            });

            req.write(data);
            req.end();
        });
    }


    //----------System configurations-------------------
    async versions() {
        return this._fetch("system/versions")
    }

    async systemConfiguration(section?) {
        let url = "system/configuration";
        if (section) {
            url += "/" + section;
        }
        return this._fetch(url);
    }


    //--------------Domains-------------------
    async getDomains(domain?) {
        let url = "domains";
        if (domain) {
            url += "/" + domain;
        }
        return this._fetch(url);
    }

    async setDomain(host, description?) {
        let data = {"mail_host": host};
        if (description) {
            data["description"] = description;
        }
        return this._send("domains", data);
    }

    async deleteDomain(host) {
        let url = "domains/" + host;

        return this._send(url, {}, "delete");
    }

    async getOwners(domain) {
        let url = "domains/" + domain + "/owners";
        return this._fetch(url);
    }

    async setOwner(domain, owner) {
        let url = "domains/" + domain + "/owners";
        let data = {"owner": owner};

        return this._send(url, data);
    }

    async deleteOwners(domain) {
        let url = "domains/" + domain + "/owners";

        return this._send(url, {}, "delete");
    }

    async getDomainLists(domain) {
        let url = "domains/" + domain + "/lists";
        return this._fetch(url);
    }


    //---------------Mailing lists-----------------
    //TODO list styles
    //TODO list archivers
    async getLists(listName?, page?, count?) {
        let url = "lists";
        if (listName) {
            url += "/" + listName;
        }
        if (page && count) {
            url += "?count=" + count + "&page=" + page;
        }
        return this._fetch(url);
    }

    async addList(fqdnListname, data?) {
        let url = "lists";
        data = Helper.nonNull(data, {});
        data["fqdn_listname"] = fqdnListname
        return this._send(url, data);
    }

    async filterLists(filterParams) {
        let url = "lists/find"
        return this._send(url, filterParams);
    }

    async deleteList(listName) {
        let url = "lists/" + listName;
        return this._send(url, {}, "delete");
    }

    async sendDigest(listName) {
        let url = "lists/" + listName;
        let data = {"send": true};

        return this._send(url, data);
    }

    async getDigest(listName) {
        let url = "lists/" + listName;

        return this._fetch(url);
    }

    //TODO Digest bumping


    //-----------------Mailing List configuration--------------------
    //TODO Header matches

    async getListConfig(list) {
        return this._fetch("lists/" + list + "/config");
    }

    //TODO change configuration with PUT

    async updateList(id, updateField, updateValue) {
        let url = "lists/" + id + "/config";
        let data = {};
        data[updateField] = updateValue;
        return this._send(url, data, "PATCH")
    }

    async getListAcceptableAliases(list) {
        return this._fetch("lists/" + list + "/config/acceptable_aliases");
    }

    //TODO set & delete ListAcceptableAliases


    //------------------------Addresses------------------------------
    //TODO UserLinking
    //TODO UserAddresses

    async setPreferredAddress(email) {
        let url = "users/" + email + "/preferred_address";
        let data = {"email": email};
        return this._send(url, data);
    }

    async getAddresses(email?) {
        let url = "addresses";
        if (email) {
            url += "/" + email;
        }
        return this._fetch(url);
    }

    async verifyAddress(email) {
        let url = "addresses/" + email + "/verify";
        return this._send(url, {});
    }

    async unverifyAddress(email) {
        let url = "addresses/" + email + "/unverify";
        return this._send(url, {});
    }

    async getAddressMemberships(email) {
        let url = "addresses/" + email + "/memberships"
        return this._fetch(url);
    }

    async deleteAddress(email) {
        let url = "addresses/" + email;
        return this._send(url, {}, "DELETE");
    }

    //------------------------Users------------------------------------

    async getUsers(idOrEmail?) {
        let url = "users";
        if (idOrEmail) {
            url += "/" + idOrEmail;
        }
        return this._fetch(url)
    }

    async createUser(email, displayName?, password?) {
        let data = {
            "email": email
        };
        if (displayName) {
            data["display_name"] = displayName;
        }
        if (password) {
            data["password"] = password;
        }

        return this._send("users", data);
    }

    async deleteUser(emailOrId) {
        return this._send("users/" + emailOrId, {}, "DELETE");
    }

    async updateUser(idOrEmail, updateField, updateValue) {
        let url = "users/" + idOrEmail;
        let data = {};
        data[updateField] = updateValue;
        return this._send(url, data, "PATCH")
    }

    async getUserAddresses(idOrEmail) {
        let url = "users/" + idOrEmail + "/addresses";
        return this._fetch(url)
    }

    async addUserAddresses(idOrEmail, newEmail) {
        let url = "users/" + idOrEmail + "/addresses";
        let data = {"email": newEmail};
        return this._send(url, data)
    }

    async loginUser(idOrEmail, password) {
        let url = "users/" + idOrEmail;
        let data = {"cleartext_password": password};
        return this._send(url, data)
    }


    //----------------------------Members----------------------
    //TODO Finding members
    async findMemberships(mail) {
        let url = "members/find";
        return this._send(url, {"subscriber": mail});
    }

    async getMembership(list, mail, role?) {
        role = Helper.nonNull(role, "member");
        let url = "lists/" + list + "/" + role + "/" + mail;

        return this._fetch(url);
    }

    //TODO ban addresses

    async getMembers(id?) {
        let url = "members";
        if (id) {
            url += "/" + id;
        }
        return this._fetch(url)
    }

    async getListMembers(list) {
        let url = "lists/" + list + "/roster/member";
        return this._fetch(url)
    }

    async getListOwners(list) {
        let url = "lists/" + list + "/roster/owner";
        return this._fetch(url);
    }

    async getListModerators(list) {
        let url = "lists/" + list + "/roster/moderator";
        return this._fetch(url);
    }

    async joinList(list, subscriberIdOrMail, role?, displayName?, preVerified?, preConfirmed?, preApproved?, sendWelcomeMessage?) {
        let data = {
            "list_id": list,
            "subscriber": subscriberIdOrMail
        }
        if (Helper.isNotNull(role)) {
            data["role"] = role;
        }
        if (Helper.isNotNull(displayName)) {
            data["display_name"] = displayName;
        }
        if (Helper.isNotNull(preVerified)) {
            data["pre_verified"] = preVerified;
        }
        if (Helper.isNotNull(preConfirmed)) {
            data["pre_confirmed"] = preConfirmed;
        }
        if (Helper.isNotNull(preApproved)) {
            data["pre_approved"] = preApproved;
        }
        if (Helper.isNotNull(sendWelcomeMessage)) {
            data["send_welcome_message"] = sendWelcomeMessage;
        }

        return this._send("members", data);
    }

    async leaveList(membershipId) {
        return this._send("members/" + membershipId, {}, "DELETE");
    }

    async changeMembership(membershipId, newData) {
        return this._send("members/" + membershipId, newData, "PATCH");
    }


    //----------------------------Queues------------------------------------------

    async listQueues(queueName?) {
        let url = "queues";
        if (queueName) {
            url += "/" + queueName;
        }
        return this._fetch(url);
    }

    async insertToQueue(queue, list, fromOrText, to?, subject?, body?) {
        let url = "queues/" + queue;
        let data = {
            "list_id": list
        }

        let text = "";
        if (body) {
            text = "" +
                "FROM: " + fromOrText + "\n" +
                "TO: " + to + "\n" +
                "Subject: " + subject + "\n" +
                "\n" +
                body;
        } else {
            text = fromOrText;
        }

        data["text"] = text;

        return this._send(url, data);
    }

    //TODO delete message


    //-----------------------------Server Owners---------------------------------
    // TODO server owners


    //----------------------------Post Moderation--------------------------------

    async getHoldMessages(list, id?) {
        let url = "lists/" + list + "/held";
        if (id) {
            url += "/" + id;
        }
        return this._fetch(url);
    }

    async getCountHoldMessages(list) {
        let url = "lists/" + list + "/held/count";
        return this._fetch(url);
    }

    async handleMessage(list, id, action, reason?) {
        let actions = ["discard", "reject", "defer", "accept"];
        if (actions.indexOf(action) === -1) {
            throw new Error("undefined action: " + action);
        }

        let params = {"action": action};
        if (Helper.isNotNull(reason) && reason.trim() !== "") {
            params["comment"] = reason;
        }

        return this._send("lists/" + list + "/held/" + id, params);
    }


    //----------------------------Preferences-------------------------------------
    //TODO Changing preferences
    //TODO Deleting preferences
    //TODO Combined member preferences
    //TODO System preferences


    //------------------------------Subscription moderation-----------------------
    //TODO Viewing subscription requests
    //TODO Viewing individual requests
    //TODO Disposing of subscription requests


    //---------------------------------Templates----------------------------------

    async updateListTemplate(list, messageName, messageTXTUrl) {
        let url = "lists/" + list + "/uris";
        let data = {}
        data[messageName] = messageTXTUrl;

        return this._send(url, data, "PATCH");
    }

    async updateDomainTemplate(domain, messageName, messageTXTUrl) {
        let url = "domains/" + domain + "/uris";
        let data = {}
        data[messageName] = messageTXTUrl;

        return this._send(url, data, "PATCH");
    }

    async updateSiteTemplate(messageName, messageTXTUrl) {
        let url = "uris";
        let data = {}
        data[messageName] = messageTXTUrl;

        return this._send(url, data, "PATCH");
    }
}
