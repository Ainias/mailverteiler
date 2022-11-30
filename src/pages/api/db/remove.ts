import { NextApiRequest, NextApiResponse } from 'next';
import { removeOnServer } from 'typeorm-sync/dist';
import {prepareApi} from "../../../application/helpers/prepareApi";

type Data = {
    success: boolean;
};

export default prepareApi(async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    const answer = await removeOnServer(req.body.modelId, req.body.entityId);

    res.status(200).json({ success: answer });
})
