import create from "zustand";
import {persist, PersistOptions} from "zustand/middleware";

type SetState<Type> = (
    newState: Type | Partial<Type> | ((state: Type) => Type | Partial<Type>),
    replace?: boolean
) => void;
type GetState<Type> = () => Readonly<Type>;

export function createZustand<Type>(creator: (set: SetState<Type>, get: GetState<Type>) => Type, persistOptions: PersistOptions<Type> | string) {
    const storageFactory: PersistOptions<Type>["getStorage"] = () => ({
        getItem: (...args) => new Promise(r => {
            if (typeof window === "undefined") {
                r(null);
            } else {
                setTimeout(() => {
                    console.log("LOG-d getItem with async", args);
                    r(window.localStorage.getItem(...args));
                }, 150);
            }
        }),
        setItem: (...args) => window.localStorage.setItem(...args),
        removeItem: (...args) => window.localStorage.removeItem(...args),
    })

    return create<Type>()(persist(creator, typeof persistOptions === "string" ? {
        name: persistOptions,
        getStorage: storageFactory
    } : {getStorage: storageFactory, ...persistOptions}))
}
