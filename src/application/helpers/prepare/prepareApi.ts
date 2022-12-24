import {NextApiRequest, NextApiResponse} from "next";
import {prepareConnection} from "../../typeorm/prepareConnection";
import {UserManager} from "../../UserManagement/UserManager";
import {getCookie} from "cookies-next";
import {User} from "../../UserManagement/User";
import {PrepareOptions} from "./PrepareOptions";
import {prepareServer} from "./prepareServer";

export type NextApiRequestWithUser = NextApiRequest & { user: User }
export type NextApiRequestWithUserMaybe = NextApiRequest & { user?: User }


export function prepareApi<ReturnVal>(handler: (req: NextApiRequest, res: NextApiResponse<ReturnVal>) => any, options: {
    validateUser: false
    accesses?: undefined
})
export function prepareApi<ReturnVal>(handler: (req: NextApiRequestWithUserMaybe, res: NextApiResponse<ReturnVal>) => any, options?: {
    validateUser: true
    needsUser?: false
    accesses?: undefined
})
export function prepareApi<ReturnVal>(handler: (req: NextApiRequestWithUser, res: NextApiResponse<ReturnVal>) => any, options?: {
    validateUser: true
    needsUser: true
    accesses?: undefined | string | string[]
}|string|string[])
export function prepareApi<ReturnVal>(handler:
                                          ((req: NextApiRequest, res: NextApiResponse<ReturnVal>) => any)
                                          | ((req: NextApiRequestWithUser, res: NextApiResponse<ReturnVal>) => any)
                                          | ((req: NextApiRequestWithUserMaybe, res: NextApiResponse<ReturnVal>) => any),
                                      options: PrepareOptions|string|string[] = {validateUser: true}) {
    return async (req: NextApiRequest, res: NextApiResponse<ReturnVal>) => {
        await prepareConnection();

        const realOptions: PrepareOptions = (typeof options === "string" || Array.isArray(options)) ? {validateUser: true, needsUser: true, accesses: options} : options;
        const device = await prepareServer(req, res, realOptions);
        if (device){
            const newRequest = req as NextApiRequestWithUser;
            newRequest.user = device.user;
            return handler(newRequest, res);
        }
        return (handler as (req: NextApiRequest, res: NextApiResponse<ReturnVal>) => any)(req, res);
    }
}
