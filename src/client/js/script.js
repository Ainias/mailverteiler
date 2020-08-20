import translationGerman from '../translations/de.json';
import translationEn from '../translations/en.json';
import {App, Translator, DataManager, Toast} from "cordova-sites/dist/client";

import "cordova-sites-user-management/dist/client/js/translationInit"
import "cordova-sites/dist/client/js/translationInit"

import {BaseDatabase} from "cordova-sites-database/dist/cordova-sites-database";
import {DeleteUserManagement1000000000000} from "cordova-sites-user-management/dist/shared//migrations/DeleteUserManagement";
import {SetupUserManagement1000000001000} from "cordova-sites-user-management/dist/shared/migrations/SetupUserManagement";
import {SetupEasySync1000000000500} from "cordova-sites-easy-sync/dist/client";
import {EasySyncClientDb} from "cordova-sites-easy-sync/dist/client/EasySyncClientDb";
import {NavbarFragment} from "cordova-sites/dist/client/js/Context/Menu/NavbarFragment";
import {SelectPersonSite} from "./Site/SelectPersonSite";
import {EasySyncBaseModel} from "cordova-sites-easy-sync/dist/shared/EasySyncBaseModel";
import {PersonInit1000000006000} from "../../shared/model/migrations/PersonInit";

import "cordova-sites-user-management/dist/client"

import {CheckMailSite} from "./Site/CheckMailSite";
import {UserManager} from "cordova-sites-user-management/dist/client/js/UserManager";

window["JSObject"] = Object;
// window["version"] = __VERSION__;

EasySyncClientDb.BASE_MODEL = EasySyncBaseModel;

App.addInitialization(async () => {
    Translator.init({
        translations: {
            "de": translationGerman,
            "en": translationEn
        },
        fallbackLanguage: "de",
        // markTranslations: true,
        markUntranslatedTranslations: true,
    });

    //Setting Title
    NavbarFragment.title = "Mail";

    await UserManager.getInstance().getMe().catch(e => console.error(e));

    // let syncJob = new SyncJob();
    //
    // await syncJob.syncInBackgroundIfDataExists([Person, MailingList]).catch(e => console.error(e));


});

DataManager._basePath = __HOST_ADDRESS__;
DataManager.onlineCallback = isOnline => {
    if (!isOnline){
        new Toast("not online!").show();
    }
};

let synchronizeDb = false;
if (synchronizeDb !== true) {
}
Object.assign(BaseDatabase.CONNECTION_OPTIONS, {
    logging: ["error",],
    synchronize: false,
    migrationsRun: true,
    migrations: [
        DeleteUserManagement1000000000000,
        SetupUserManagement1000000001000,
        SetupEasySync1000000000500,
        PersonInit1000000006000,
    ]
});

let app = new App();
app.start(SelectPersonSite).catch(e => console.error(e)).then(async () => {
    window["queryDb"] = async (sql) => {
        let res = await EasySyncClientDb.getInstance().rawQuery(sql);
        console.log(res);
        return res;
    }
});
app.ready(() => {
    console.log("initialisation over", new Date());
    if (device.platform === "browser"){
        // Check that service workers are supported
        if ('serviceWorker' in navigator) {
            // Use the window load event to keep the page load performant
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('service-worker.js');
            });
        }
    }
});