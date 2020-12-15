import {SyncController} from "cordova-sites-user-management/dist/server/v1/controller/SyncController";
import {MailmanApi} from "../MailmanApi";
import {Person} from "../../../../shared/model/Person";
import {Helper} from "js-helper/dist/shared/Helper";
import {In, IsNull, Not, QueryBuilder, SelectQueryBuilder} from "typeorm/index";
import * as typeorm from "typeorm";
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
            const api = MailmanApi.getInstance();

            const queryBuilder = <SelectQueryBuilder<any>>await EasySyncServerDb.getInstance().createQueryBuilder(Person);
            if (Helper.isNotNull(queries[0].member)) {
                let members: any = [];

                if (queries[0].list) {
                    if (queries[0].member === "member") {
                        members = await api.getListMembers(queries[0].list);
                    } else if (queries[0].member === "owner") {
                        members = await api.getListOwners(queries[0].list);
                    } else if (queries[0].member === "moderator") {
                        members = await api.getListModerators(queries[0].list);
                    } else if (queries[0].member === false) {
                        members = await api.getListMembers(queries[0].list);
                    }
                } else {
                    members = [];
                }

                members = Array.isArray(members.entries) ? members.entries : members;

                if (members.length > 0) {
                    mails = members.map(m => m.email);
                    if (queries[0].member !== false) {
                        queryBuilder.andWhere("Person.email IN(:...mailsList)", {mailsList: mails})
                    } else {
                        queryBuilder.andWhere("Person.email NOT IN(:...mailsNotList)", {mailsNotList: mails})
                    }
                } else if (queries[0].member !== false) {
                    //End early since there are no members or moderators
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
            }

            const membersOf = {};

            const addressesIn = [];
            const addressesNotIn = [];
            await Helper.asyncForEach(Object.keys(queries[0].memberships), async list => {
                let members = await api.getListMembers(list);
                members = Array.isArray(members.entries) ? members.entries : [];
                const mails = members.map(m => m.email);

                membersOf[list] = mails;

                if (queries[0].memberships[list]) {
                    addressesIn.push(...mails);
                } else {
                    addressesNotIn.push(...mails);
                }
            });

            if (addressesIn.length > 0) {
                queryBuilder.andWhere("Person.email IN(:...addressesIn)", {addressesIn: addressesIn})
            }
            if (addressesNotIn.length > 0) {
                queryBuilder.andWhere("Person.email NOT IN(:...addressesNotIn)", {addressesNotIn: addressesNotIn})
            }

            const query = queries[0]
            let offset = req.query.offset;

            let lastSynced = Helper.nonNull(query.lastSynced, 0);
            let where = Helper.nonNull(query.where, {});
            let orderBy = Helper.nonNull(query.orderBy, {});

            let dateLastSynced = new Date(parseInt(lastSynced || 0));
            let newDateLastSynced = new Date().getTime();

            orderBy = Helper.nonNull(orderBy, {"id": "ASC"});

            offset = parseInt(offset);

            where = where || {};

            queryBuilder.andWhere("Person.updatedAt >= :lastSync", {"lastSync": dateLastSynced});
            Object.keys(where).forEach((key, i) => {
                if (where[key] && where[key].type && where[key].value && where[key].type === "like") {
                    queryBuilder.andWhere("Person." + key + " LIKE :val", {val: where[key].value})
                } else {
                    const param = {};
                    param["val"+i] = (where[key].value ? where[key].value : where[key]);
                    queryBuilder.andWhere(key + " = :val"+i, param)
                }
            });
            queryBuilder.orderBy(orderBy);
            queryBuilder.limit(this.MAX_MODELS_PER_RUN);
            queryBuilder.offset(offset);
            let entities = await queryBuilder.getMany()

            if (typeof Person.prepareSync === "function") {
                entities = await Person.prepareSync(entities);
            }

            entities = entities.map(e => e.toJSON());

            const listNames = Object.keys(queries[0].memberships);
            entities.forEach(p => {
                const mail = p.email;
                listNames.forEach(list => {
                    p["list-"+list] = (membersOf[list].indexOf(mail) >= 0)
                })
            })

            let result: any = {
                "model": Person.getSchemaName(),
                "newLastSynced": newDateLastSynced,
                "entities": entities,
                "nextOffset": offset + entities.length,
                "shouldAskAgain": entities.length === this.MAX_MODELS_PER_RUN
            };

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

            lists.pw = false;
            const listModel = await MailingList.findOne({"mailmanId": lists.list_id});
            if (listModel !== null) {
                lists.pw = true;

            }
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
        const reason = req.body.reason;

        let listModel = await MailingList.findOne({"mailmanId": listId});
        if (listModel === null) {
            return res.json({});
        }

        let hashedPassword = MailingList.hashPassword(listModel, listPassword);
        if (hashedPassword !== listModel.password) {
            return res.json({});
        }

        let api = MailmanApi.getInstance();
        let result = await api.handleMessage(listId, request, action, reason)
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

    static async synchronizeLists(req, res) {
        const lists = {
            "altfreunde": "altfreund",
            "hauskreise": "hk",
            "international-news": "internationalnews",
            "isa": "isalist",
            "ma": "malist",
        }

        let api = MailmanApi.getInstance();
        await Helper.asyncForEach(Object.keys(lists), async list => {
            let listId = list + "@" + process.env.DOMAIN_NAME;
            let mailmanList = await api.getLists(listId);

            //CreateList
            if (mailmanList.title && mailmanList.title === "404 Not Found") {
                mailmanList = await api.addList(listId);
                if (mailmanList === undefined) {
                    await api.updateList(listId, "description", "");
                    await api.updateList(listId, "subject_prefix", "[" + list + "]");
                    await api.updateList(listId, "default_member_action", "hold");
                    await api.updateList(listId, "default_nonmember_action", "hold");
                    await api.updateList(listId, "respond_to_post_requests", false);
                }
            }

            const personsThatShouldBeInList = await EasySyncServerDb.getInstance().rawQuery("SELECT mailmanId, email FROM person WHERE " + lists[list] + " >= 1");
            let currentMembers = await api.getListMembers(listId);
            currentMembers = Array.isArray(currentMembers.entries) ? currentMembers.entries : [];

            const currentMemberMails = currentMembers.map(m => m.email);
            const personsToAdd = personsThatShouldBeInList.filter(person => currentMemberMails.indexOf(person.email) === -1);

            console.log("has to add " + personsToAdd.length + " persons to maillist " + listId);
            listId = list + "." + process.env.DOMAIN_NAME;
            await Helper.asyncForEach(personsToAdd, async person => {
                const res = await api.joinList(listId, person.mailmanId, null, null, true, true, true, false);
            });
            console.log("done adding " + personsToAdd.length + " persons to maillist " + listId);
        }, true);
        return res.json({success: true});
    }

    static async deletePassword(req, res) {
        const listId = req.body.list_id;

        const model = await MailingList.findOne({"mailmanId": listId});
        if (model) {
            let db: EasySyncServerDb = await EasySyncServerDb.getInstance();
            db.deleteEntity(model, MailingList, true);
        }

        return res.json(true);
    }
}