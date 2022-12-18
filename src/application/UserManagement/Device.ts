import {SyncModel} from 'typeorm-sync';
import {Entity, ManyToOne} from 'typeorm';
import {GlobalRef} from "../GlobalRef";
import {User, UserType} from "./User";

@Entity()
class Device extends SyncModel {

    userAgent: string

    lastActive: Date

    @ManyToOne(() => User, (user: UserType) => user.devices)
    user?: UserType;

}

const Saved = new GlobalRef<typeof Device>('model.Device');
if (!Saved.value()) {
    Saved.setValue(Device);
}
const GlobalDevice = Saved.typedValue();
type GlobalDevice = Device;
export {GlobalDevice as Device};
