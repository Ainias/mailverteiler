import {NextApiRequest, NextApiResponse} from 'next';
import {prepareConnection} from '../../../application/typeorm/prepareConnection';
import {waitForSyncRepository} from "typeorm-sync";
import {User} from "../../../models/User";
import {UserManager} from "../../../application/UserManagement/UserManager";

type Data = {
    success: true;
    token: string,
    user: User
} | {
    success: false,
    message: string
};

export default async function login(req: NextApiRequest, res: NextApiResponse<Data>) {
    await prepareConnection();

    const email = req.body.email;
    const password = req.body.password;

    const userRepository =await waitForSyncRepository(User);
    const user = await userRepository.findOneBy({ email: email.toLowerCase(), activated: true, blocked: false });
    const userManager = UserManager.getInstance();
    let token = undefined;

    if (user && userManager.hashPassword(user, password) === user.password) {
         token = userManager.generateTokenFor(user);
    }

    console.log("LOG-d userManager", userManager);

    if (token) {
        res.status(200).json({
            success: true,
            token,
            user
        });
    } else {
        res.status(403).json({
            success: false,
            message: "wrong email or password"
        });
    }
}
