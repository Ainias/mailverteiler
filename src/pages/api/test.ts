import {NextApiRequest, NextApiResponse} from 'next';
import {prepareApi} from "../../application/helpers/prepareApi";

type Data = {
    success: boolean;
};

export default prepareApi(async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    res.status(200).json({success: true});
})
