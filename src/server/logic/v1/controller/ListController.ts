import {SyncController} from "cordova-sites-user-management/dist/server/v1/controller/SyncController";
import {MailmanApi} from "../MailmanApi";
import {Person} from "../../../../shared/model/Person";
import {Helper} from "js-helper/dist/shared/Helper";
import {In, IsNull, Not} from "typeorm/index";
import {EasySyncServerDb} from "cordova-sites-easy-sync/dist/server/EasySyncServerDb";
import {MailingList} from "../../../../shared/model/MailingList";

export class ListController extends SyncController {

    static async _addOrUpdatePerson(mailmanId, mail) {
        let api = MailmanApi.getInstance();

        let personData = null;
        if (mailmanId !== null) {
            personData = await api.getUsers(mailmanId);
        }

        if (personData === null || personData.title && personData.title === "404 Not Found") {
            personData = await api.createUser(mail);

            if (personData === undefined) {
                await api.verifyAddress(mail);
                await api.setPreferredAddress(mail);
            }

            personData = await api.getUsers(mail);
        } else {
            let addresses: any = await api.getUserAddresses(mailmanId);
            if (addresses.total_size != 1 || addresses.entries[0].email !== mail) {
                if (addresses.entries) {
                    await Helper.asyncForEach(addresses.entries, async addr => {
                        await api.deleteAddress(addr.email);
                    }, true);
                }
                await api.addUserAddresses(mailmanId, mail);
                await api.verifyAddress(mail);
                await api.setPreferredAddress(mail);
            }
        }
        return personData;
    }

    static async modifyPerson(req, res) {
        let modelData = req.body.person;

        modelData.email = modelData.email.toLowerCase();
        let person: any = await this._doModifyModel(Person, modelData);

        let api = MailmanApi.getInstance();

        let personData = await this._addOrUpdatePerson(person.mailmanId, person.email);

        person.mailmanId = personData.user_id;
        await person.save();

        let newMemberships = req.body.memberships;

        let currentMemberships: any = await api.findMemberships(person.email);
        if (currentMemberships && currentMemberships.entries) {
            await Helper.asyncForEach(currentMemberships.entries, async m => {
                let index = newMemberships.indexOf(m.list_id);
                if (index !== -1) {
                    newMemberships.splice(index, 1);
                } else {
                    await api.leaveList(m.member_id);
                }
            });
        }

        await Helper.asyncForEach(newMemberships, async m => {
            await api.joinList(m, person.mailmanId, null, null, true, true, true, false);
        }, true)

        return res.json(person);
    }

    static async getPersons(req, res) {
        let queries = JSON.parse(req.query.queries);
        if (queries.length >= 1 && queries[0].model === Person.getSchemaName()) {
            let mails: any = [];
            let filterLater = false;
            if (Helper.isNotNull(queries[0].member)) {
                let api = MailmanApi.getInstance();
                let members: any = [];
                let where = queries[0].where;

                if (queries[0].list) {
                    if (queries[0].member === "member") {
                        members = await api.getListMembers(queries[0].list);
                    } else if (queries[0].member === "owner") {
                        members = await api.getListOwners(queries[0].list);
                    } else if (queries[0].member === "moderator") {
                        members = await api.getListModerators(queries[0].list);
                    } else if (queries[0].member === false) {
                        members = await api.getListMembers(queries[0].list);
                        members = members.entries ? members.entries : [];
                    }
                } else {
                    members = [];
                }

                members = Array.isArray(members.entries) ? members.entries : members;

                if (members.length > 0) {
                    mails = members.map(m => m.email);

                    let filter = (queries[0].member !== false) ? In(mails) : Not(In(mails));
                    if (where["email"]) {
                        filterLater = true;
                    } else {
                        where["email"] = filter;
                    }
                    queries[0].where = where;
                } else if (queries[0].member !== false) {
                    return res.json({
                        "nextOffset": -1,
                        "newLastSynced": new Date().getTime(),
                        "results": [{
                            "model": Person,
                            "newLastSynced": new Date().getTime(),
                            "entities": [],
                            "nextOffset": 0,
                            "shouldAskAgain": false
                        }]
                    });
                }
                // req.query.queries = JSON.stringify(queries);
            }
            let result: any = await super._execQuery(queries[0], req.query.offset, req);
            if (filterLater) {
                result.entities = result.entities.filter(person => (mails.indexOf(person.email) === -1) === (queries[0].member === false))
            }
            result = {
                "nextOffset": result.nextOffset,
                "newLastSynced": new Date().getTime(),
                "results": [result]
            };
            return res.json(result);
        }
        return res.json({});
    }

    static async deletePersons(req, res) {
        let personToDeleteIds = req.body.personIds;
        let persons = await Person.findByIds(personToDeleteIds);

        let api = MailmanApi.getInstance();
        await Helper.asyncForEach(persons, async person => {
            if (person.mailmanId) {
                await api.deleteUser(person.mailmanId);
            }
        }, true);

        let db: EasySyncServerDb = await EasySyncServerDb.getInstance();
        db.deleteEntity(persons, Person, true);
        return res.json({});
    }

    static async getLists(req, res) {
        let listName = Helper.nonNull(req.query.listname, null);
        let api = MailmanApi.getInstance();

        let lists: any = await api.getLists(listName, req.query.page, req.query.count);
        if (listName && lists) {
            let config: any = await api.getListConfig(listName);
            lists = Object.assign(config, lists);
        }

        return res.json(lists)
    }

    static async modifyList(req, res) {
        const DOMAIN_NAME = process.env.DOMAIN_NAME;

        let listId = req.body.list_id;
        let name = req.body.display_name.toLowerCase();
        let description = req.body.description;
        let subjectPrefix = req.body.subject_prefix;

        let defaultMemberAction = req.body.default_member_action;
        let defaultNonmemberAction = req.body.default_nonmember_action;

        let api = MailmanApi.getInstance();
        let lists: any = null;
        let listModel = null;
        if (listId) {
            lists = await api.getLists(listId);
        }

        let list = null;
        let mail = name + "@" + DOMAIN_NAME;
        if (lists) {
            list = lists;

            if (list.fqdn_listname !== mail) {
                await api.updateList(list.list_id, "display_name", name);
            }
            if (list.description !== description) {
                await api.updateList(list.list_id, "description", description);
            }
            if (list.subject_prefix !== subjectPrefix) {
                await api.updateList(list.list_id, "subject_prefix", subjectPrefix);
            }
            if (list.default_member_action !== defaultMemberAction) {
                await api.updateList(list.list_id, "default_member_action", defaultMemberAction);
            }
            if (list.default_nonmember_action !== defaultNonmemberAction) {
                await api.updateList(list.list_id, "default_nonmember_action", defaultNonmemberAction);
            }
            if (typeof req.body.pw === "string" && req.body.pw.length >= 8) {
                listModel = await MailingList.findOne({"mailmanId": listId});
                if (listModel === null) {
                    listModel = new MailingList();
                    listModel.mailmanId = listId;
                }
                listModel.password = MailingList.hashPassword(listModel, req.body.pw);
                listModel.save();
            }
        } else {
            list = await api.addList(mail);
            if (list === undefined) {
                list = await api.getLists(mail);
                await api.updateList(list.list_id, "description", description);
                await api.updateList(list.list_id, "subject_prefix", subjectPrefix);
                await api.updateList(list.list_id, "default_member_action", defaultMemberAction);
                await api.updateList(list.list_id, "default_nonmember_action", defaultNonmemberAction);
                await api.updateList(list.list_id, "respond_to_post_requests", false);
                if (typeof req.body.pw === "string" && req.body.pw.length >= 8) {
                    listId = list.list_id;
                    listModel = await MailingList.findOne({"mailmanId": listId});
                    if (listModel === null) {
                        listModel = new MailingList();
                        listModel.mailmanId = listId;
                    }
                    listModel.password = MailingList.hashPassword(listModel, req.body.pw);
                    listModel.save();
                }
            }
        }

        return res.json(list)
    }

    static async deleteLists(req, res) {
        let listsToDelete = req.body.lists;

        let api = MailmanApi.getInstance();
        let listDeletionResult = await Helper.asyncForEach(listsToDelete, async list => {
            return await api.deleteList(list);
        }, true);

        return res.json(listDeletionResult);
    }

    static async getMemberships(req, res) {
        let api = MailmanApi.getInstance();
        let memberships = await api.findMemberships(req.query.email);

        return res.json(memberships);
    }

    static async addMember(req, res) {
        let list_id = req.body.list_id;
        let user_id = req.body.subscriber;
        let role = Helper.nonNull(req.body.role, "member");

        let api = MailmanApi.getInstance();
        let membership = await api.joinList(list_id, user_id, role, null, true, true, true, false);

        if (membership !== undefined) {
            return res.json(membership);
        } else {
            membership = await api.getMembership(list_id, req.body.subscriberMail, role);
            return res.json(membership);
        }
    }

    static async getHoldMail(req, res) {
        let listId = req.body.list;
        let listPassword = req.body.pw + "";

        let listModel = await MailingList.findOne({"mailmanId": listId});
        if (listModel === null) {
            return res.json({});
        }

        let hashedPassword = MailingList.hashPassword(listModel, listPassword);
        if (hashedPassword !== listModel.password) {
            return res.json({});
        }

        let api = MailmanApi.getInstance();
        let mails = await api.getHoldMessages(listId);

        return res.json(mails);
    }

    static async handleMessage(req, res) {
        let listId = req.body.list;
        let request = req.body.request;
        let listPassword = req.body.pw + "";
        let action = req.body.action;

        let listModel = await MailingList.findOne({"mailmanId": listId});
        if (listModel === null) {
            return res.json({});
        }

        let hashedPassword = MailingList.hashPassword(listModel, listPassword);
        if (hashedPassword !== listModel.password) {
            return res.json({});
        }

        let api = MailmanApi.getInstance();
        let result = await api.handleMessage(listId, request, action)
        if (result === undefined) {
            return res.json({success: true});
        } else {
            return res.json(result);
        }
    }

    static async leaveList(req, res) {
        let list_id = req.body.list_id;
        let user_mail = req.body.subscriberMail;
        let role = Helper.nonNull(req.body.role, "member");

        let api = MailmanApi.getInstance();

        let membership: any = await api.getMembership(list_id, user_mail, role);

        if (membership && membership.member_id) {
            await api.leaveList(membership.member_id);
            return res.json({});
        } else if (membership) {
            return res.json(membership);
        } else {
            return res.json({error: true})
        }
    }

    static async synchronise(req, res) {
        let api = MailmanApi.getInstance();
        let mailmanAddresses: any = await api.getAddresses();

        const MAX_ENTRIES = 10;

        //From Mailman to program
        if (mailmanAddresses.entries) {
            let mails = [];
            mailmanAddresses.entries.forEach(entry => {
                if (entry.user) {
                    mails.push(entry.email)
                }
            });
            let personsOfAddresses = await Person.find({"email": In(mails)});

            let personMails = [];
            await Helper.asyncForEach(personsOfAddresses, async person => {
                if (!person.mailmanId) {
                    let personData: any = await api.getUsers(person.email);
                    if (personData.user_id) {
                        person.mailmanId = personData.user_id;
                        person.save();
                    }
                }
                personMails.push(person.email);
            }, true)

            //TODO filter and delete adresses that are not there
            let oldMails = mails.filter(email => personMails.indexOf(email) === -1);
            console.log("oldMails", oldMails);
            await Helper.asyncForEach(oldMails, async email => {
                await api.deleteUser(email);
            })
        }

        //From program to mailman
        let persons = await Person.find({"mailmanId": IsNull()}, undefined, MAX_ENTRIES)
        await Helper.asyncForEach(persons, async person => {
            await this._addOrUpdatePerson(person.mailmanId, person.email);
        });

        let result = {"success": true}
        if (persons.length === MAX_ENTRIES) {
            result["askAgain"] = true;
        }

        return res.json(result);
    }
}