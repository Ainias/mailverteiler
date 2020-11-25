import * as express from 'express';
import {userRoutes, syncRoutes, UserManager} from "cordova-sites-user-management/dist/server";
import {ListController} from "./controller/ListController";
import {RIGHTS} from "../../../shared/RIGHTS";

const routerV1 = express.Router();

const errorHandler = (fn, context) => {
    return (req, res, next) => {
        const resPromise = fn.call(context, req,res,next);
        if (resPromise && resPromise.catch){
            resPromise.catch(err => next(err));
        }
    }
};

routerV1.use("/sync", syncRoutes);
routerV1.use("/user", userRoutes);
// routerV1.post("/maillist", errorHandler(UserManager.setUserFromToken, UserManager), errorHandler(ListController.modifyList, ListController));
routerV1.post("/modifyPerson", errorHandler(UserManager.checkAccess(RIGHTS.EDIT_USER), UserManager), errorHandler(ListController.modifyPerson, ListController));

routerV1.get("/lists", errorHandler(UserManager.checkAccess(RIGHTS.VIEW_LIST), UserManager), errorHandler(ListController.getLists, ListController));
routerV1.post("/list", errorHandler(UserManager.checkAccess(RIGHTS.EDIT_LIST), UserManager), errorHandler(ListController.modifyList, ListController));
routerV1.post("/addMember", errorHandler(UserManager.checkAccess(RIGHTS.EDIT_USER), UserManager), errorHandler(ListController.addMember, ListController));
routerV1.post("/leaveList", errorHandler(UserManager.checkAccess(RIGHTS.EDIT_USER), UserManager), errorHandler(ListController.leaveList, ListController));
routerV1.get("/memberships", errorHandler(UserManager.checkAccess(RIGHTS.VIEW_LIST), UserManager), errorHandler(ListController.getMemberships, ListController));
routerV1.get("/persons", errorHandler(UserManager.checkAccess(RIGHTS.VIEW_USER), UserManager), errorHandler(ListController.getPersons, ListController));
routerV1.post("/deletePersons", errorHandler(UserManager.checkAccess(RIGHTS.EDIT_USER), UserManager), errorHandler(ListController.deletePersons, ListController));
routerV1.post("/deleteLists", errorHandler(UserManager.checkAccess(RIGHTS.EDIT_LIST), UserManager), errorHandler(ListController.deleteLists, ListController));
routerV1.get("/synchronise", errorHandler(UserManager.checkAccess(RIGHTS.EDIT_USER), UserManager), errorHandler(ListController.synchronise, ListController));
routerV1.post("/mails", errorHandler(ListController.getHoldMail, ListController));
routerV1.post("/handleMail", errorHandler(ListController.handleMessage, ListController));
routerV1.post("/deletePassword", errorHandler(UserManager.checkAccess(RIGHTS.EDIT_LIST), UserManager), errorHandler(ListController.deletePassword, ListController));
routerV1.get("/synchroniseLists", errorHandler(UserManager.checkAccess(RIGHTS.EDIT_USER), UserManager), errorHandler(ListController.synchronizeLists, ListController));

export {routerV1};