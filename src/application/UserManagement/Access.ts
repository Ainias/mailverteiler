import {Column, Entity} from 'typeorm';
import {SyncModel} from 'typeorm-sync';
import {GlobalRef} from '../GlobalRef';

@Entity()
class Access extends SyncModel {

    @Column()
    name: string;

    @Column()
    description: string;
}

const Saved = new GlobalRef<typeof Access>('model.Access');
if (!Saved.value()) {
    Saved.setValue(Access);
}
const GlobalAccess = Saved.typedValue();
type GlobalAccess = Access;
export {GlobalAccess as Access};
