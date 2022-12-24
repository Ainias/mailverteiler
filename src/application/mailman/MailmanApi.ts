import * as https from "https";
import * as querystring from "querystring";
import {Helper} from "js-helper/dist/shared/Helper";
import * as http from "http";
import {ResultList} from "./types/ResultList";
import {isMailmanError, MailmanError} from "./types/MailmanError";
import {ListType} from "./types/ListType";

export class MailmanApi {
    private readonly rootUrl: string;
    private readonly username: string;
    private readonly password: string;

    private static instance: MailmanApi;

    constructor(rootUrl: string, username: string, password: string) {
        this.rootUrl = rootUrl;
        this.username = username;
        this.password = password;
    }

    static getInstance() {
        return this.instance;
    }

    static init(rootUrl: string, username: string, password: string) {
        this.instance = new MailmanApi(rootUrl, username, password);
    }

    private async load<Result>(path): Promise<Result> {
        return new Promise((resolve, reject) => {
            const url = new URL(this.rootUrl + path);
            const options = {
                host: url.hostname,
                port: url.port,
                path: url.pathname,
                auth: `${this.username}:${this.password}`,
            };

            const req = (url.protocol === "http:" ? http : https).get(options, res => {
                res.setEncoding("utf8");
                let body = "";
                res.on("data", data => {
                    body += data;
                });
                res.on("end", () => {
                    try {
                        if (body === "") {
                            resolve(undefined);
                        } else {
                            const result = JSON.parse(body);
                            if (isMailmanError(result)){
                                reject(result);
                            }
                            resolve(JSON.parse(body) as Result);
                        }
                    } catch (e) {
                        console.error("JSON-PARSE-ERROR: ", url.toString(), body);
                        reject(e);
                    }
                });
            });
            req.on("error", (e) => {
                reject(e);
            });
        });
    }

    private async send<Result>(path, data?, method?) {
        method = Helper.nonNull(method, "post");

        return new Promise<Result>((resolve, reject) => {
            data = querystring.stringify(data || {});

            const url = new URL(this.rootUrl + path);
            const options = {
                host: url.hostname,
                port: url.port,
                path: url.pathname,
                auth: `${this.username}:${this.password}`,
                method,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(data)
                }
            };

            const req = (url.protocol === "http:" ? http : https).request(options, res => {
                // console.log(res.statusCode);
                let body = "";
                res.on("data", data => {
                    body += data;
                });
                res.on("end", () => {
                    try {
                        if (body === "") {
                            resolve(undefined);
                        } else {
                            const result = JSON.parse(body);
                            if (isMailmanError(result)){
                                reject(result);
                            }
                            resolve(result as Result);
                        }
                    } catch (e) {
                        console.error("JSON-PARSE-ERROR: ", url.toString(), body);
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


    // ----------System configurations-------------------
    async versions() {
        return this.load("system/versions");
    }

    async systemConfiguration(section?) {
        let url = "system/configuration";
        if (section) {
            url += `/${section}`;
        }
        return this.load(url);
    }


    // --------------Domains-------------------
    async getDomains(domain?) {
        let url = "domains";
        if (domain) {
            url += `/${domain}`;
        }
        return this.load(url);
    }

    async setDomain(host, description?) {
        const data = {"mail_host": host};
        if (description) {
            data.description = description;
        }
        return this.send("domains", data);
    }

    async deleteDomain(host) {
        const url = `domains/${host}`;

        return this.send(url, {}, "delete");
    }

    async getDomainOwners(domain) {
        const url = `domains/${domain}/owners`;
        return this.load(url);
    }

    async setDomainOwner(domain, owner) {
        const url = `domains/${domain}/owners`;
        const data = {"owner": owner};

        return this.send(url, data);
    }

    async deleteDomainOwners(domain) {
        const url = `domains/${domain}/owners`;

        return this.send(url, {}, "delete");
    }

    async getDomainLists(domain) {
        const url = `domains/${domain}/lists`;
        return this.load(url);
    }


    // ---------------Mailing lists-----------------
    // TODO list styles
    // TODO list archivers

    async getLists(page?: number, count?: number) {
        let url = "lists";
        if (page && count) {
            url += `?count=${count}&page=${page}`;
        }
        return this.load<ResultList>(url);
    }

    async getList(name: string) {
        const url = `lists/${name}`;
        return this.load<ListType>(url);
    }

    async addList(fqdnListname, data?) {
        const url = "lists";
        data = Helper.nonNull(data, {});
        data.fqdn_listname = fqdnListname;
        return this.send<undefined>(url, data);
    }

    async filterLists(filterParams) {
        const url = "lists/find";
        return this.send(url, filterParams);
    }

    async deleteList(listName) {
        const url = `lists/${listName}`;
        return this.send(url, {}, "delete");
    }

    async sendDigest(listName) {
        const url = `lists/${listName}`;
        const data = {"send": true};

        return this.send(url, data);
    }

    async getDigest(listName) {
        const url = `lists/${listName}`;

        return this.load(url);
    }

    // TODO Digest bumping


    // -----------------Mailing List configuration--------------------
    // TODO Header matches

    async getListConfig(list) {
        return this.load(`lists/${list}/config`);
    }

    // TODO change configuration with PUT

    async updateList(id, updateField, updateValue) {
        const url = `lists/${id}/config`;
        const data = {};
        data[updateField] = updateValue;
        return this.send(url, data, "PATCH");
    }

    async getListAcceptableAliases(list) {
        return this.load(`lists/${list}/config/acceptable_aliases`);
    }

    // TODO set & delete ListAcceptableAliases


    // ------------------------Addresses------------------------------
    // TODO UserLinking
    // TODO UserAddresses

    async setPreferredAddress(email) {
        const url = `users/${email}/preferred_address`;
        const data = {"email": email};
        return this.send(url, data);
    }

    async getAddresses(email?) {
        let url = "addresses";
        if (email) {
            url += `/${email}`;
        }
        return this.load(url);
    }

    async verifyAddress(email) {
        const url = `addresses/${email}/verify`;
        return this.send(url, {});
    }

    async unverifyAddress(email) {
        const url = `addresses/${email}/unverify`;
        return this.send(url, {});
    }

    async getAddressMemberships(email) {
        const url = `addresses/${email}/memberships`;
        return this.load(url);
    }

    async deleteAddress(email) {
        const url = `addresses/${email}`;
        return this.send(url, {}, "DELETE");
    }

    // ------------------------Users------------------------------------

    async getUsers(idOrEmail?) {
        let url = "users";
        if (idOrEmail) {
            url += `/${idOrEmail}`;
        }
        return this.load(url);
    }

    async createUser(email, displayName?, password?) {
        const data = {
            "email": email
        };
        if (displayName) {
            data.display_name = displayName;
        }
        if (password) {
            data.password = password;
        }

        return this.send("users", data);
    }

    async deleteUser(emailOrId) {
        return this.send(`users/${emailOrId}`, {}, "DELETE");
    }

    async updateUser(idOrEmail, updateField, updateValue) {
        const url = `users/${idOrEmail}`;
        const data = {};
        data[updateField] = updateValue;
        return this.send(url, data, "PATCH");
    }

    async getUserAddresses(idOrEmail) {
        const url = `users/${idOrEmail}/addresses`;
        return this.load(url);
    }

    async addUserAddresses(idOrEmail, newEmail) {
        const url = `users/${idOrEmail}/addresses`;
        const data = {"email": newEmail};
        return this.send(url, data);
    }

    async loginUser(idOrEmail, password) {
        const url = `users/${idOrEmail}`;
        const data = {"cleartext_password": password};
        return this.send(url, data);
    }


    // ----------------------------Members----------------------
    // TODO Finding members
    async findMemberships(mail) {
        const url = "members/find";
        return this.send(url, {"subscriber": mail});
    }

    async getMembership(list, mail, role?) {
        role = Helper.nonNull(role, "member");
        const url = `lists/${list}/${role}/${mail}`;

        return this.load(url);
    }

    // TODO ban addresses

    async getMembers(id?) {
        let url = "members";
        if (id) {
            url += `/${id}`;
        }
        return this.load(url);
    }

    async getListMembers(list) {
        const url = `lists/${list}/roster/member`;
        return this.load(url);
    }

    async getListOwners(list) {
        const url = `lists/${list}/roster/owner`;
        return this.load(url);
    }

    async getListModerators(list) {
        const url = `lists/${list}/roster/moderator`;
        return this.load(url);
    }

    async joinList(list, subscriberIdOrMail, role?, displayName?, preVerified?, preConfirmed?, preApproved?, sendWelcomeMessage?) {
        const data = {
            "list_id": list,
            "subscriber": subscriberIdOrMail
        };
        if (Helper.isNotNull(role)) {
            data.role = role;
        }
        if (Helper.isNotNull(displayName)) {
            data.display_name = displayName;
        }
        if (Helper.isNotNull(preVerified)) {
            data.pre_verified = preVerified;
        }
        if (Helper.isNotNull(preConfirmed)) {
            data.pre_confirmed = preConfirmed;
        }
        if (Helper.isNotNull(preApproved)) {
            data.pre_approved = preApproved;
        }
        if (Helper.isNotNull(sendWelcomeMessage)) {
            data.send_welcome_message = sendWelcomeMessage;
        }

        return this.send("members", data);
    }

    async leaveList(membershipId) {
        return this.send(`members/${membershipId}`, {}, "DELETE");
    }

    async changeMembership(membershipId, newData) {
        return this.send(`members/${membershipId}`, newData, "PATCH");
    }


    // ----------------------------Queues------------------------------------------

    async listQueues(queueName?) {
        let url = "queues";
        if (queueName) {
            url += `/${queueName}`;
        }
        return this.load(url);
    }

    async insertToQueue(queue, list, fromOrText, to?, subject?, body?) {
        const url = `queues/${queue}`;
        const data = {
            "list_id": list
        };

        let text = "";
        if (body) {
            text = `` +
                `FROM: ${fromOrText}\n` +
                `TO: ${to}\n` +
                `Subject: ${subject}\n` +
                `\n${
                    body}`;
        } else {
            text = fromOrText;
        }

        data.text = text;

        return this.send(url, data);
    }

    // TODO delete message


    // -----------------------------Server Owners---------------------------------
    // TODO server owners


    // ----------------------------Post Moderation--------------------------------

    async getHoldMessages(list, id?) {
        let url = `lists/${list}/held`;
        if (id) {
            url += `/${id}`;
        }
        return this.load(url);
    }

    async getCountHoldMessages(list) {
        const url = `lists/${list}/held/count`;
        return this.load(url);
    }

    async handleMessage(list, id, action, reason?) {
        const actions = ["discard", "reject", "defer", "accept"];
        if (actions.indexOf(action) === -1) {
            throw new Error(`undefined action: ${action}`);
        }

        const params = {"action": action};
        if (Helper.isNotNull(reason) && reason.trim() !== "") {
            params.comment = reason;
        }

        return this.send(`lists/${list}/held/${id}`, params);
    }


    // ----------------------------Preferences-------------------------------------
    // TODO Changing preferences
    // TODO Deleting preferences
    // TODO Combined member preferences
    // TODO System preferences


    // ------------------------------Subscription moderation-----------------------
    // TODO Viewing subscription requests
    // TODO Viewing individual requests
    // TODO Disposing of subscription requests


    // ---------------------------------Templates----------------------------------

    async updateListTemplate(list, messageName, messageTXTUrl) {
        const url = `lists/${list}/uris`;
        const data = {};
        data[messageName] = messageTXTUrl;

        return this.send(url, data, "PATCH");
    }

    async updateDomainTemplate(domain, messageName, messageTXTUrl) {
        const url = `domains/${domain}/uris`;
        const data = {};
        data[messageName] = messageTXTUrl;

        return this.send(url, data, "PATCH");
    }

    async updateSiteTemplate(messageName, messageTXTUrl) {
        const url = "uris";
        const data = {};
        data[messageName] = messageTXTUrl;

        return this.send(url, data, "PATCH");
    }
}
