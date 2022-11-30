import { Database, DatabaseOptions } from 'typeorm-sync/dist';
import { GlobalRef } from '../GlobalRef';
import {syncModels} from "../../models/syncModels";

const connectionPromise = new GlobalRef<Promise<Database>>('smd-mail.database');

Database.setSyncModels(syncModels);

const getConnectionOptions = () =>
    ({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DB,
        synchronize: true,
        logging: false,
    } as DatabaseOptions);

export function prepareServerConnection() {
    if (!connectionPromise.value()) {
        connectionPromise.setValue(Database.init(getConnectionOptions()));
    }
    return connectionPromise.value();
}
