import {NextApiRequest, NextApiResponse} from 'next';
import {waitForSyncRepository} from "typeorm-sync";
import {User} from "../../../application/UserManagement/User";
import {UserManager} from "../../../application/UserManagement/UserManager";
import {prepareApi} from "../../../application/helpers/prepare/prepareApi";
import {Device} from "../../../application/UserManagement/Device";

export type LoginResponseData = {
    success: true;
    user: User
    accesses: string[]
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
        // Logged in
        const device = new Device();
        device.user = user;
        device.userAgent = req.headers["user-agent"];
        device.lastActive = new Date();

        const deviceRepository = await waitForSyncRepository(Device);
        await deviceRepository.save(device);

        token = await userManager.generateTokenFor(device);
    }

    if (token) {
        userManager.setToken(token, req, res);
        const accesses = (await userManager.findAccessesForUserId(user.id)).map(a => a.name);

        res.status(200).json({
            success: true,
            user,
            accesses
        });
    } else {
        userManager.deleteToken(req, res);
        res.status(403).json({
            success: false,
            message: "wrong email or password"
        });
    }
})
