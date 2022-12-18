import {User} from "./User";
import crypto from "crypto";
import {GlobalRef} from "../GlobalRef";
import {EncryptJWT, jwtDecrypt, JWTPayload} from "jose";
import {Device} from "./Device";
import {getSyncRepository} from "typeorm-sync";
import {deleteCookie, setCookie} from "cookies-next";
import {NextApiRequest, NextApiResponse} from "next";
import {RoleManager} from "./RoleManager";
import {Access} from "./Access";

const defaultUserManagerConfig = {
    saltLength: 12,
    expiresIn: "7d",
    recheckPasswordAfterSeconds: 60 * 5,
    userNeedsToBeActivated: true,

}
export type UserManagerConfig = typeof defaultUserManagerConfig;

class UserManager {

    private static instance: UserManager;

    static init(pepper: string, jwtSecret: string, config?: Partial<UserManagerConfig>) {
        this.instance = new UserManager(pepper, jwtSecret, config);
    }

    static getInstance() {
        return this.instance;
    }

    private config = {...defaultUserManagerConfig};
    private readonly pepper: string;
    private readonly jwtSecret: string;

    private constructor(pepper: string, jwtSecret: string, config: Partial<UserManagerConfig> = {}) {
        this.config = {...defaultUserManagerConfig, ...config};
        this.pepper = pepper;
        this.jwtSecret = jwtSecret;
    }

    private generateSalt() {
        let length = this.config.saltLength;
        return crypto
            .randomBytes(Math.ceil(length / 2))
            .toString('hex')
            .slice(0, length);
    }

    hashPassword(user: User, password: string) {
        if (!this.pepper) {
            throw new Error("hashPassword: No pepper defined!")
        }

        if (!user.salt) {
            user.salt = this.generateSalt();
        }
        let hash = crypto.createHmac('sha512', user.salt + this.pepper);
        hash.update(password);
        return hash.digest('hex');
    }

    getTokenPayload(device: Device) {
        return {
            deviceId: device.id,
            userAgent: device.userAgent,
            lastActive: device.lastActive.toISOString(),
            deviceUpdatedAt: device.updatedAt?.toISOString(),
            deviceCreatedAt: device.createdAt?.toISOString(),
            deviceDeletedAt: device.deletedAt?.toISOString(),

            userId: device.user.id,
            passwordHash: device.user.password,
            email: device.user.email,
            username: device.user.username,
            activated: device.user.activated,
            blocked: device.user.blocked,
            userUpdatedAt: device.user.updatedAt?.toISOString(),
            userCreatedAt: device.user.createdAt?.toISOString(),
            userDeletedAt: device.user.deletedAt?.toISOString(),
        };
    }

    async generateTokenFor(device: Device) {
        return new EncryptJWT(this.getTokenPayload(device))
            .setProtectedHeader({alg: 'dir', enc: 'A128CBC-HS256'})
            .setIssuedAt()
            .setExpirationTime(this.config.expiresIn)
            .encrypt(new TextEncoder().encode(this.jwtSecret))
    }

    async validateToken(token: string) {
        const {payload}: { payload: JWTPayload & ReturnType<typeof this.getTokenPayload> } = await jwtDecrypt(token, new TextEncoder().encode(this.jwtSecret))
        const nowInSeconds = Math.floor(new Date().getTime() / 1000);

        if (nowInSeconds - payload.iat > this.config.recheckPasswordAfterSeconds) {
            const findOptions = {
                where: {
                    id: payload.deviceId,
                    user: {id: payload.userId, password: payload.passwordHash, blocked: false}
                },
                relations: ["user"]
            };
            if (this.config.userNeedsToBeActivated) {
                findOptions.where.user["activated"] = true;
            }
            const deviceRepository = getSyncRepository(Device);
            const device = await deviceRepository.findOne(findOptions);

            if (!device) {
                // TODO throw authentication error
                throw new Error("wrong token error");
            }
            device.lastActive = new Date();
            await deviceRepository.save(device);
            return [await this.generateTokenFor(device), device] as const;
        }

        const device = new Device();
        device.userAgent = payload.userAgent;
        device.lastActive = new Date(payload.lastActive);
        device.deletedAt = payload.deviceDeletedAt ? new Date(payload.deviceDeletedAt) : undefined;
        device.createdAt = payload.deviceCreatedAt ? new Date(payload.deviceCreatedAt) : undefined;
        device.updatedAt = payload.deviceUpdatedAt ? new Date(payload.deviceUpdatedAt) : undefined;

        device.user = new User();
        device.user.id = payload.userId;
        device.user.password = payload.passwordHash;
        device.user.email = payload.email;
        device.user.username = payload.username;
        device.user.activated = payload.activated;
        device.user.blocked = payload.blocked;

        device.user.deletedAt = payload.userDeletedAt ? new Date(payload.userDeletedAt) : undefined;
        device.user.createdAt = payload.userCreatedAt ? new Date(payload.userCreatedAt) : undefined;
        device.user.updatedAt = payload.userUpdatedAt ? new Date(payload.userUpdatedAt) : undefined;

        return [token,device] as const;
    }

    setToken(token: string, req: NextApiRequest, res: NextApiResponse){
        setCookie("token", token, {req, res, httpOnly: true, maxAge: 7 * 24 * 60 * 60, secure: process.env.NODE_ENV !== "development"})
    }

    deleteToken(req: NextApiRequest, res: NextApiResponse){
        deleteCookie("token", {req, res})
    }

    async findAccessesForUserId(userId: number){
        const userRepository = getSyncRepository(User);
        const user = await userRepository.findOne({where: {id: userId}, relations: ["roles", "roles.accesses"]})
        const accessesForRoles = await Promise.all(user.roles.map(role => RoleManager.getInstance().findAccessesForRole(role)));
        return [].concat(...accessesForRoles) as Access[];
    }
}

const userManagerGlobalRef = new GlobalRef<typeof UserManager>('smd-mail.userManager');
if (!userManagerGlobalRef.value()) {
    userManagerGlobalRef.setValue(UserManager);
}
const val = userManagerGlobalRef.value();
export {val as UserManager}
