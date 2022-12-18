import {Column, Entity, JoinTable, ManyToMany, OneToMany} from 'typeorm';
import {SyncModel} from 'typeorm-sync';
import {GlobalRef} from '../GlobalRef';
import {Role} from "./Role";
import {Device} from "./Device";

@Entity()
class User extends SyncModel {

    @Column()
    username: string;

    @Column({unique: true})
    email: string;

    @Column()
    password: string;

    @Column()
    activated: boolean;

    @Column()
    blocked: boolean;

    @Column()
    salt: string;

    @ManyToMany(() => Role)
    @JoinTable({name: "userRole"})
    roles?: Role[];

    @OneToMany(() => Device, device => device.user)
    devices?: Device[]

    toJSON(){
        return {
            ...this,
            email: "",
            password: "",
            salt: "",
        }
    }
}

export type UserType = User;

const Saved = new GlobalRef<typeof User>('model.User');
if (!Saved.value()) {
    Saved.setValue(User);
}
const GlobalUser = Saved.typedValue();
type GlobalUser = User;
export {GlobalUser as User};
