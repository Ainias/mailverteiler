import {User} from "./User";
import {createZustand} from "../helpers/createZustand";

const initialState = {
    user: undefined as User|undefined,
};

type SetState = (
    newState: UserState | Partial<UserState> | ((state: UserState) => UserState | Partial<UserState>),
    replace?: boolean
) => void;
type GetState = () => Readonly<UserState>;

const actionsGenerator = ((set: SetState, get: GetState) => ({
    setUserData(user: User|undefined) {
        set({user})
    },
    clear() {
        set({...actionsGenerator(set, get)}, true);
    },
}));

export type UserState = typeof initialState & ReturnType<typeof actionsGenerator>;
export const useUser = createZustand<UserState>((set, get) => ({
    ...initialState,
    ...actionsGenerator(set, get),
}), {
    name: "user",
    version: 0,
});
