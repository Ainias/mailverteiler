import {Column, Entity, JoinTable, ManyToMany} from 'typeorm';
import {SyncModel} from 'typeorm-sync';
import {GlobalRef} from '../application/GlobalRef';
import {Role} from "./Role";

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
}

const Saved = new GlobalRef<typeof User>('model.User');
if (!Saved.value()) {
    Saved.setValue(User);
}
const GlobalUser = Saved.typedValue();
type GlobalUser = User;
export {GlobalUser as User};
