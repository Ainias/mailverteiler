import {User} from "../../models/User";
import crypto from "crypto";
import {jwt} from "jsonwebtoken";


export class UserManager {

    private static instance: UserManager;

    static getInstance(){
        return this.instance;
    }

    SALT_LENGTH = 12;
    PEPPER: string;
    EXPIRES_IN = "7d";

    private generateSalt() {
        let length = this.SALT_LENGTH;
        return crypto
            .randomBytes(Math.ceil(length / 2))
            .toString('hex')
            .slice(0, length);
    }

    hashPassword(user: User, password: string){
        if (!this.PEPPER){
            throw new Error("hashPassword: No pepper defined!")
        }

        if (!user.salt) {
            user.salt = this.generateSalt();
        }
        let hash = crypto.createHmac('sha512', user.salt + this.PEPPER);
        hash.update(password);
        return hash.digest('hex');
    }

    generateTokenFor(user: User){
        return jwt.sign({ userId: user.id, passwordHash: user.password }, process.env.JWT_SECRET, {
            expiresIn: this.EXPIRES_IN,
        });
    }
}
