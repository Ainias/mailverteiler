import {NextApiResponse} from 'next';
import {NextApiRequestWithUser, prepareApi} from "../../application/helpers/prepare/prepareApi";
import {MailmanApi} from "../../application/mailman/MailmanApi";

export type TestMailmanData = {
    success: boolean;
    result?: any
};

export default prepareApi(async (req: NextApiRequestWithUser, res: NextApiResponse<Data>) => {
    const action = req.body.action;
    const args = req.body.args ?? [];

    const api = MailmanApi.getInstance();

    if (action in api && typeof api[action] === "function"){
        const result = await api[action](...args);
        res.status(200).json({success: true, result});
    }

    res.status(400).json({success: false});
}, "admin")
