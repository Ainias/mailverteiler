import {User} from "./User";
import crypto from "crypto";
import {GlobalRef} from "../GlobalRef";
import {EncryptJWT, jwtDecrypt} from "jose";

const defaultUserManagerConfig = {
    saltLength: 12,
    expiresIn: "7d",
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

    async generateTokenFor(user: User) {
        return new EncryptJWT({userId: user.id, passwordHash: user.password})
            .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
            .setIssuedAt()
            .setExpirationTime(this.config.expiresIn)
            .encrypt(new TextEncoder().encode(this.jwtSecret))
    }

    async getUserFromToken(token: string) {
        const {payload} = await jwtDecrypt(token, new TextEncoder().encode(this.jwtSecret))
        console.log("LOG-d decoded", payload);
        // const where: FindOptionsWhere<User> = {id: decoded.id, password: decoded.passwordHash, blocked: false};
        // if (this.config.userNeedsToBeActivated) {
        //     where["activated"] = true;
        // }
        //
        // return await (await waitForSyncRepository(User)).findOne({where});
    }
}

const userManagerGlobalRef = new GlobalRef<typeof UserManager>('smd-mail.userManager');
if (!userManagerGlobalRef.value()) {
    userManagerGlobalRef.setValue(UserManager);
}
const val = userManagerGlobalRef.value();
export {val as UserManager}
