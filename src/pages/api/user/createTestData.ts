import {NextApiRequest, NextApiResponse} from 'next';
import {waitForSyncRepository} from "typeorm-sync";
import {User} from "../../../application/UserManagement/User";
import {UserManager} from "../../../application/UserManagement/UserManager";
import {prepareApi} from "../../../application/helpers/prepare/prepareApi";
import {Access} from "../../../application/UserManagement/Access";
import {Role} from "../../../application/UserManagement/Role";

export type LoginResponseData = {
    success: true;
    user: User
    accesses: string[]
} | {
    success: false,
    message: string
};

export default prepareApi(async (req: NextApiRequest, res: NextApiResponse<any>) => {
    const accessRepository = await waitForSyncRepository(Access);

    const viewUserAccess = new Access();
    viewUserAccess.name = "view-person";
    viewUserAccess.description = "Can see persons";
    await accessRepository.save(viewUserAccess);

    const editUserAccess = new Access();
    editUserAccess.name = "modify-person";
    editUserAccess.description = "Can edit persons";
    await accessRepository.save(editUserAccess);

    const viewListAccess = new Access();
    viewListAccess.name = "view-list";
    viewListAccess.description = "Can see lists";
    await accessRepository.save(viewListAccess);

    const editListAccess = new Access();
    editListAccess.name = "modify-list";
    editListAccess.description = "Can edit lists";
    await accessRepository.save(editListAccess);

    const roleRepository = await waitForSyncRepository(Role);

    const adminRole = new Role();
    adminRole.name = "admin";
    adminRole.description = "is admin";
    adminRole.accesses = [viewUserAccess, editUserAccess, viewListAccess, editListAccess];
    await roleRepository.save(adminRole);

    const userRepository = await waitForSyncRepository(User);
    const userManager = UserManager.getInstance();

    const user = new User();
    user.username = "Admin"
    user.email = "test@silas.link"
    user.password = userManager.hashPassword(user, "123456789");
    user.blocked = false;
    user.activated = true;
    user.roles = [adminRole];
    await userRepository.save(user);

    return res.status(200).json({success: true});
})
