import {Role} from "./Role";
import {getSyncRepository} from "typeorm-sync";

export class RoleManager {
    private static instance: RoleManager;

    static getInstance(){
        if (!RoleManager.instance){
            RoleManager.instance = new RoleManager();
        }
        return RoleManager.instance;
    }

    async findAccessesForRole(role: Role) {
        const accesses = role.accesses;

        const roleRepository = getSyncRepository(Role);
        const parentRoles = await roleRepository.find({where: {children: {id: role.id}}, relations: ["accesses"]})
        const parentAccesses = await Promise.all(parentRoles.map(async role => this.findAccessesForRole(role)));
        accesses.concat(...parentAccesses);
        return accesses;
    }
}
