import { NextApiRequest, NextApiResponse } from 'next';
import { queryFromClient } from 'typeorm-sync/dist';
import {prepareApi} from "../../../application/helpers/prepare/prepareApi";

type PromiseResolvedType<T> = T extends Promise<infer R> ? R : never;
type ReturnedPromiseResolvedType<T extends (...args: any) => any> = PromiseResolvedType<ReturnType<T>>;

type Data = {
    success: boolean;
} & ReturnedPromiseResolvedType<typeof queryFromClient>;

export default prepareApi(async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    const answer = await queryFromClient(req.body.lastQueryDate, req.body.queryOptions);
    res.status(200).json({ success: true, ...answer });
})
