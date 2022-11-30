import { Database, DatabaseOptions } from 'typeorm-sync/dist';
import SQLjs from 'sql.js';
import {syncModels} from "../../models/syncModels";
import { post} from "../fetcher";
import {JSONValue} from "js-helper";

let connectionPromise: Promise<Database> | null = null;

Database.setSyncModels(syncModels);

const connectionOptions: DatabaseOptions = {
    type: 'sqljs',
    location: 'smdMail',
    driver: SQLjs,
    sqlJsConfig: {
        locateFile: (file: string) => {
            return `/${file}`;
        },
    },
    autoSave: true,
    useLocalForage: true,
    synchronize: true,
    logging: false,
    isClient: true,
    persist: (modelId, entityId, syncContainer, extraData) => post("/api/db/persist", {
        modelId,
        entityId,
        syncContainer,
        extraData
    }),
    query: (lastQueryDate, queryOptions, extraData) => post("/api/db/query", {
        lastQueryDate: lastQueryDate.toISOString(),
        queryOptions: queryOptions as unknown as JSONValue,
        extraData
    }),
    remove: (modelId, entityId, extraData) => post('/api/db/remove', {
        modelId,
        entityId,
        extraData
    }),
};

export function prepareBrowserConnection() {
    if (!connectionPromise) {
        connectionPromise = Database.destroy()
            .catch((e) => console.error(e))
            .then(() => Database.init(connectionOptions));
        connectionPromise.catch(e => console.error(e));
    }
    return connectionPromise;
}
