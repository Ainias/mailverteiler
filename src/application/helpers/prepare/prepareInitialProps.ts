import {NextPage, NextPageContext} from "next";
import {prepareConnection} from "../../typeorm/prepareConnection";
import {PrepareOptions} from "./PrepareOptions";
import {prepareServer} from "./prepareServer";
import {useUserData} from "../../UserManagement/useUserData";
import {setServerUser} from "../../UserManagement/useUser";

export function prepareInitialProps<Type>(getInitialProps: NextPage<Type>["getInitialProps"], options: PrepareOptions|string|string[] = {validateUser: true}){
    return async ({req, res, ...args}: NextPageContext) => {
        await prepareConnection();

        const realOptions: PrepareOptions = (typeof options === "string" || Array.isArray(options)) ? {validateUser: true, needsUser: true, accesses: options} : options;
        if (req){
            // is server
            const device = await prepareServer(req, res, realOptions);
            if (device){
                setServerUser(device.user);
            }
            return getInitialProps({req, res, ...args});
        } else {
            // is client
            if (realOptions.validateUser && realOptions.needsUser && !useUserData.getState().user){
                // TODO change error to UserError/ValidationError
                throw new Error("user not logged in, but route need logged in user!")
            }
            if (realOptions.accesses){
                const neededAccesses = Array.isArray(realOptions.accesses) ? realOptions.accesses: [realOptions.accesses];
                const accessSet = new Set(useUserData.getState().accesses);
                if (neededAccesses.some(a => !accessSet.has(a))) {
                    throw new Error("user needed accesses '" + neededAccesses.join("', '") + "' but got accesses '" + useUserData.getState().accesses.join("', '") + "'")
                }
            }
        }
    }
}
