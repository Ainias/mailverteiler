import {NextApiRequest, NextApiResponse} from "next";
import {prepareConnection} from "../typeorm/prepareConnection";
import {UserManager} from "../UserManagement/UserManager";

export function prepareApi<ReturnVal>(handler: (req: NextApiRequest, res: NextApiResponse<ReturnVal>) => any){
    return async (req: NextApiRequest, res: NextApiResponse<ReturnVal>) => {
        if (!UserManager.getInstance()){
            UserManager.init(process.env.PEPPER, process.env.JWT_SECRET);
        }
        await prepareConnection();
        return handler(req, res);
    }
}
