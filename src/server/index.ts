import "dotenv/config";
import {EasySyncServerDb} from "cordova-sites-easy-sync/dist/server";

import * as path from "path";

import * as express from 'express';
import {routes} from './routes';

//Import Models
import "cordova-sites-user-management/dist/shared";
import "../shared/model/Person"

import {UserManager} from "cordova-sites-user-management/dist/server";
import {SetupUserManagement1000000001000} from "cordova-sites-user-management/dist/shared"
import {DeleteUserManagement1000000000000} from "cordova-sites-user-management/dist/shared"
import {MailmanApi} from "./logic/v1/MailmanApi";
import {PersonInit1000000006000} from "../shared/model/migrations/PersonInit";
import {MailingListInit1000000007000} from "../shared/model/migrations/MailingListInit";
import {Data1000000005000} from "./migrations/Data";
import {Data1000000005001} from "./migrations/Data2";

const port = process.env.PORT || 3000;
process.env.JWT_SECRET = process.env.JWT_SECRET || "mySecretioöqwe78034hjiodfu80ä^";

// BaseModel._databaseClass = EasySyncServerDb;
EasySyncServerDb.CONNECTION_PARAMETERS = {
    "type": "mysql",
    "host": process.env.MYSQL_HOST || "localhost",
    "port": process.env.MYSQL_PORT || "3306",
    "username": process.env.MYSQL_USER || "root",
    "password": process.env.MYSQL_PASSWORD || "",
    "database": process.env.MYSQL_DATABASE || "smd_kontakt",
    "synchronize": false,
    "migrationsRun": true,
    "migrations": [
        DeleteUserManagement1000000000000,
        SetupUserManagement1000000001000,
        Data1000000005000,
        Data1000000005001,
        PersonInit1000000006000,
        MailingListInit1000000007000,
    ],

    "logging": false,
};

UserManager.PEPPER = process.env.PEPPER || "mySecretPepper";
UserManager.REGISTRATION_IS_ACTIVATED = true;
UserManager.REGISTRATION_DEFAULT_ROLE_IDS = [4];

const app = express();

//Todo guten wert finden?
app.use(express.json({limit: "50mb"}));

//Allow Origin setzen bevor rest passiert
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', "true");

    // Pass to next layer of middleware
    next();
});

app.use('/mail/api', routes);
app.use('/api', routes);
app.get('/newMailTemplate', (req, res) => {
    res.setHeader("content-type", 'text/plain; charset="UTF-8"');
    res.send("Eine E-Mail wartet auf Approval fuer die Liste $display_name. \n\n"+process.env.CHECK_MAIL_SITE);
});
app.get('/footerTemplate', (req, res) => {
    res.setHeader("content-type", 'text/plain; charset="UTF-8"');
    res.send("--\nHochschul-SMD Aachen\nhttp://www.smd-aachen.de\n\nFalls du keine Mails mehr bekommen möchtest, schreib bitte eine E-Mail mit der Bitte um Abmeldung an kontakt@smd-aachen.de");
});

app.use(express.static(path.resolve(path.dirname(process.argv[1]), "public")));
app.use("/mail", express.static(path.resolve(path.dirname(process.argv[1]), "public")));

//Handle errors
app.use(function (err, req, res, next) {
    console.error(err);
    res.status(err.status || 500);
    if (err instanceof Error) {
        res.json({error: err.message});
    } else {
        res.json({error: err});
    }
});

EasySyncServerDb.getInstance()._connectionPromise.then(async () => {
    MailmanApi.init(process.env.MAILMAN_URL, process.env.MAILMAN_USER, process.env.MAILMAN_PASSWORD);

    // let api = MailmanApi.getInstance();
    // console.log(await api.versions());

    app.listen(port, async () => {
        console.log("listening on port " + port);
    });
});
