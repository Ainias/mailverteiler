import {NextApiRequest, NextApiResponse} from 'next';
import {prepareApi} from "../../../application/helpers/prepare/prepareApi";
import {RIGHTS} from "../../../application/Rights";
import {MailmanApi} from "../../../application/mailman/MailmanApi";
import {ResultList} from "../../../application/mailman/types/ResultList";
import {ListType} from "../../../application/mailman/types/ListType";
import {DOMAIN_NAME} from "../../../application/mailman/domainName";
import {isMailmanError} from "../../../application/mailman/types/MailmanError";


export type GetListsData = {
    success: true;
    lists?: ResultList
} | {
    success: false,
    error: string
};

export default prepareApi(async (req: NextApiRequest, res: NextApiResponse<GetListsData>) => {
    console.log("LOG-d method", req.method);

    if (req.method === "GET") {
        const api = MailmanApi.getInstance();

        const lists = await api.getLists(Number(req.query.page), Number(req.query.count));
        console.log("LOG-d lists", lists);

        res.status(200).json({success: true, lists});

    } else if (req.method === "POST") {
        const api = MailmanApi.getInstance();

        const {listId, description, prefix, memberAction, nonmemberAction} = req.body;
        const name = req.body.name.toLowerCase();
        const mail = `${name}@${DOMAIN_NAME}`;

        let list: ListType | undefined;
        const listModel = null;
        if (listId) {
            list = await api.getList(listId);
        }

        if (list) {
            console.log("LOG-d should update list!", list);
            // if (list.fqdn_listname !== mail) {
            //     await api.updateList(list.list_id, "display_name", name);
            // }
            // if (list.description !== description) {
            //     await api.updateList(list.list_id, "description", description);
            // }
            // if (list.subject_prefix !== subjectPrefix) {
            //     await api.updateList(list.list_id, "subject_prefix", subjectPrefix);
            // }
            // if (list.default_member_action !== defaultMemberAction) {
            //     await api.updateList(list.list_id, "default_member_action", defaultMemberAction);
            // }
            // if (list.default_nonmember_action !== defaultNonmemberAction) {
            //     await api.updateList(list.list_id, "default_nonmember_action", defaultNonmemberAction);
            // }
            // if (typeof req.body.pw === "string" && req.body.pw.length >= 8) {
            //     listModel = await MailingList.findOne({"mailmanId": listId});
            //     if (listModel === null) {
            //         listModel = new MailingList();
            //         listModel.mailmanId = listId;
            //     }
            //     listModel.password = MailingList.hashPassword(listModel, req.body.pw);
            //     listModel.save();
            // }
        } else {
            try {
                await api.addList(mail);

                list = await api.getList(listId);
                await api.updateList(list.list_id, "description", description);
                await api.updateList(list.list_id, "subject_prefix", prefix);
                await api.updateList(list.list_id, "default_member_action", memberAction);
                await api.updateList(list.list_id, "default_nonmember_action", nonmemberAction);
                await api.updateList(list.list_id, "respond_to_post_requests", false);

            } catch (e) {
                console.error(e);
                const errorMessage = isMailmanError(e) ? e.description : e.message ?? e;
                res.status(400).json({success: false, error: errorMessage});
                return;
            }

            // TODO save password
            // if (typeof req.body.pw === "string" && req.body.pw.length >= 8) {
            //     listId = list.list_id;
            //     listModel = await MailingList.findOne({"mailmanId": listId});
            //     if (listModel === null) {
            //         listModel = new MailingList();
            //         listModel.mailmanId = listId;
            //     }
            //     listModel.password = MailingList.hashPassword(listModel, req.body.pw);
            //     listModel.save();
            // }
            res.status(200).json({success: true});


        }
    }
}, RIGHTS.VIEW_LIST);
