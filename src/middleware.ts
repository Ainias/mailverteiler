import {NextRequest} from "next/server";
import {User} from "./application/UserManagement/User";

export type UserRequest<T> = T & {user?: User}

export async function middleware(req: UserRequest<NextRequest>){
    const token = req.cookies.get("token")?.value;
    // console.log("LOG-d token", token);

    if (token){
        // const user = await UserManager.getInstance().getUserFromToken(token);
        // console.log("LOG-d user", user);
    }
}
