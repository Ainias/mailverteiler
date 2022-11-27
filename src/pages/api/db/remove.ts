import { NextApiRequest, NextApiResponse } from 'next';
import { removeOnServer } from 'typeorm-sync/dist';
import { prepareConnection } from '../../../application/typeorm/prepareConnection';

type Data = {
    success: boolean;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    await prepareConnection();
    const answer = await removeOnServer(req.body.modelId, req.body.entityId);

    res.status(200).json({ success: answer });
}
