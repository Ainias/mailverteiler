import {User} from "./User";
import {createZustand} from "../helpers/createZustand";

const initialState = {
    user: undefined as User | undefined,
    accesses: [] as string[]
};

type SetState = (
    newState: UserState | Partial<UserState> | ((state: UserState) => UserState | Partial<UserState>),
    replace?: boolean
) => void;
type GetState = () => Readonly<UserState>;

const actionsGenerator = ((set: SetState, get: GetState) => ({
    setUser(user: User | undefined) {
        set({user})
    },
    setAccesses(accesses: string[]) {
        set({accesses})
    },
    clear() {
        set({...actionsGenerator(set, get)}, true);
    },
}));

export type UserState = typeof initialState & ReturnType<typeof actionsGenerator>;
export const useUserData = createZustand<UserState>((set, get) => ({
    ...initialState,
    ...actionsGenerator(set, get),
}), {
    name: "user",
    version: 0,
    getStorage: () => ({
        getItem: (...args) => {
            if (typeof window === "undefined") {
                return null;
            } else {
                return window.localStorage.getItem(...args);
            }
        },
        setItem: (...args) => window.localStorage.setItem(...args),
        removeItem: (...args) => window.localStorage.removeItem(...args),
    })
});
