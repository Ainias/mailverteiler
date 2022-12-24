import { NextApiRequest, NextApiResponse } from 'next';
import { persistFromClient, SyncContainer } from 'typeorm-sync/dist';
import {prepareApi} from "../../../application/helpers/prepare/prepareApi";

type Data = {
    success: boolean;
    syncContainer: SyncContainer;
};

export default prepareApi(async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    const answer = await persistFromClient(req.body.modelId, req.body.entityId, req.body.syncContainer);

    res.status(200).json({ success: true, syncContainer: answer });
});
