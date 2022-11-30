import {Column, Entity, JoinTable, ManyToMany} from 'typeorm';
import {SyncModel} from 'typeorm-sync';
import {GlobalRef} from '../GlobalRef';
import {Access} from "./Access";

@Entity()
class Role extends SyncModel {
    @Column()
    name: string;

    @Column()
    description: string;

    @ManyToMany(() => Role, role => role.children)
    @JoinTable({
        name: "roleChildren",
        joinColumn: {name: "parentId", referencedColumnName: "id"},
        inverseJoinColumn: {name: "childId", referencedColumnName: "id"}
    })
    parents: Role[]

    @ManyToMany(() => Role, role => role.parents)
    children: Role[]

    @ManyToMany(() => Access)
    @JoinTable({name: "roleAccess"})
    accesses?: Access[];
}

const Saved = new GlobalRef<typeof Role>('model.Role');
if (!Saved.value()) {
    Saved.setValue(Role);
}
const GlobalRole = Saved.typedValue();
type GlobalRole = Role;
export {GlobalRole as Role};
