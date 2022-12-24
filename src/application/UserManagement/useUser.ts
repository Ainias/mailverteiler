import {useUserData} from "./useUserData";
import {User} from "./User";

let serverUser: User|undefined

export function useUser() {
    if (typeof window === 'undefined') {
        // server
        console.log("LOG-d returning from server")
        return serverUser;
    } else {
        // browser
        console.log("LOG-d returning from client")
        return useUserData(s => s.user);
    }
}


export function setServerUser(user: User){
    serverUser=user;
}
