import {NextApiRequest, NextApiResponse} from "next";
import {prepareConnection} from "../typeorm/prepareConnection";
import {UserManager} from "../UserManagement/UserManager";
import {getCookie} from "cookies-next";
import {User} from "../UserManagement/User";

type PrepareApiOptions = {
    validateUser: false
    accesses?: undefined
} | {
    validateUser: true
    needsUser?: false
    accesses?: undefined
} | {
    validateUser: true
    needsUser: true
    accesses?: undefined | string | string[]
}

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
})
export function prepareApi<ReturnVal>(handler:
                                          ((req: NextApiRequest, res: NextApiResponse<ReturnVal>) => any)
                                          | ((req: NextApiRequestWithUser, res: NextApiResponse<ReturnVal>) => any)
                                          | ((req: NextApiRequestWithUserMaybe, res: NextApiResponse<ReturnVal>) => any),
                                      options: PrepareApiOptions = {validateUser: true}) {
    return async (req: NextApiRequest, res: NextApiResponse<ReturnVal>) => {
        if (!UserManager.getInstance()) {
            UserManager.init(process.env.PEPPER, process.env.JWT_SECRET);
        }
        await prepareConnection();

        if (options.validateUser) {
            const userManager = UserManager.getInstance();
            const token = getCookie("token", {req, res}) as string;
            if (token) {
                try {
                    const [newToken, device] = await userManager.validateToken(token);
                    userManager.setToken(newToken, req, res);
                    const newRequest = req as NextApiRequestWithUser;
                    newRequest.user = device.user;


                    // TODO cache accesses?
                    if (options.accesses) {
                        const neededAccesses = Array.isArray(options.accesses) ? options.accesses : [options.accesses];
                        const accesses = (await userManager.findAccessesForUserId(device.user.id)).map(a => a.name);
                        const accessSet = new Set(accesses);
                        if (neededAccesses.some(a => !accessSet.has(a))) {
                            throw new Error("user with id " + device.user.id + " needed accesses '" + neededAccesses.join("', '") + "' but got accesses '" + accesses.join("', '") + "'")
                        }
                    }

                    return handler(newRequest, res);
                } catch (e) {
                    console.error("Got token error", e);
                    throw e;
                }
            } else if (options.needsUser) {
                throw new Error("route needs user, but no token given")
            } else {
                console.log("LOG-d got no token :/");
            }
        }

        return (handler as (req: NextApiRequest, res: NextApiResponse<ReturnVal>) => any)(req, res);
    }
}
