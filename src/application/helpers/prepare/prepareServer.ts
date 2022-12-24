import {UserManager} from "../../UserManagement/UserManager";
import {getCookie} from "cookies-next";
import {NextApiRequest, NextApiResponse} from "next";
import {IncomingMessage, ServerResponse} from "http";
import {PrepareOptions} from "./PrepareOptions";
import {MailmanApi} from "../../mailman/MailmanApi";

export async function prepareServer(req: NextApiRequest|IncomingMessage, res: NextApiResponse|ServerResponse, options: PrepareOptions){
    if (!UserManager.getInstance()) {
        UserManager.init(process.env.PEPPER, process.env.JWT_SECRET);
    }
    MailmanApi.init(process.env.MAILMAN_URL, process.env.MAILMAN_USER, process.env.MAILMAN_PASSWORD);


    if (options.validateUser) {
        const userManager = UserManager.getInstance();
        const token = getCookie("token", {req, res}) as string;
        if (token) {
            try {
                const [newToken, device] = await userManager.validateToken(token);
                userManager.setToken(newToken, req, res);

                // TODO cache accesses?
                if (options.accesses) {
                    const neededAccesses = Array.isArray(options.accesses) ? options.accesses : [options.accesses];
                    const accesses = (await userManager.findAccessesForUserId(device.user.id)).map(a => a.name);
                    const accessSet = new Set(accesses);
                    if (neededAccesses.some(a => !accessSet.has(a))) {
                        throw new Error("user with id " + device.user.id + " needed accesses '" + neededAccesses.join("', '") + "' but got accesses '" + accesses.join("', '") + "'")
                    }
                }

                return device;
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
    return undefined;
}
