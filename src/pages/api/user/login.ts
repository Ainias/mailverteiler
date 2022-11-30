import {NextApiRequest, NextApiResponse} from 'next';
import {waitForSyncRepository} from "typeorm-sync";
import {User} from "../../../application/UserManagement/User";
import {UserManager} from "../../../application/UserManagement/UserManager";
import {setCookie, deleteCookie} from "cookies-next";
import {prepareApi} from "../../../application/helpers/prepareApi";

export type LoginResponseData = {
    success: true;
    user: User
} | {
    success: false,
    message: string
};

export default prepareApi(async (req: NextApiRequest, res: NextApiResponse<LoginResponseData>) => {
    const email = req.body.email;
    const password = req.body.password;

    const userRepository = await waitForSyncRepository(User);
    const user = await userRepository.findOneBy({email: email.toLowerCase(), activated: true, blocked: false});
    const userManager = UserManager.getInstance();

    let token = undefined;

    if (user && userManager.hashPassword(user, password) === user.password) {
        token = await userManager.generateTokenFor(user);
    }

    if (token) {
        setCookie("token", token, {req, res, httpOnly: true, maxAge: 7 * 24 * 60 * 60, secure: process.env.NODE_ENV !== "development"})
        res.status(200).json({
            success: true,
            user
        });
    } else {
        deleteCookie("token", {req, res})
        res.status(403).json({
            success: false,
            message: "wrong email or password"
        });
    }
})
