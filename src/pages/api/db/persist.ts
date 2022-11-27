import { NextApiRequest, NextApiResponse } from 'next';
import { persistFromClient, SyncContainer } from 'typeorm-sync/dist';
import { prepareConnection } from '../../../application/typeorm/prepareConnection';

type Data = {
    success: boolean;
    syncContainer: SyncContainer;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    await prepareConnection();
    const answer = await persistFromClient(req.body.modelId, req.body.entityId, req.body.syncContainer);

    res.status(200).json({ success: true, syncContainer: answer });
}
