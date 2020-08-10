import * as express from 'express';
import {userRoutes, syncRoutes, UserManager} from "cordova-sites-user-management/dist/server";
import {ListController} from "./controller/ListController";

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
routerV1.post("/modifyPerson", errorHandler(UserManager.setUserFromToken, UserManager), errorHandler(ListController.modifyPerson, ListController));

routerV1.get("/lists", errorHandler(UserManager.setUserFromToken, UserManager), errorHandler(ListController.getLists, ListController));
routerV1.post("/list", errorHandler(UserManager.setUserFromToken, UserManager), errorHandler(ListController.modifyList, ListController));
routerV1.post("/addMember", errorHandler(UserManager.setUserFromToken, UserManager), errorHandler(ListController.addMember, ListController));
routerV1.post("/leaveList", errorHandler(UserManager.setUserFromToken, UserManager), errorHandler(ListController.leaveList, ListController));
routerV1.get("/memberships", errorHandler(UserManager.setUserFromToken, UserManager), errorHandler(ListController.getMemberships, ListController));
routerV1.get("/persons", errorHandler(UserManager.setUserFromToken, UserManager), errorHandler(ListController.getPersons, ListController));
routerV1.post("/deletePersons", errorHandler(UserManager.setUserFromToken, UserManager), errorHandler(ListController.deletePersons, ListController));
routerV1.post("/deleteLists", errorHandler(UserManager.setUserFromToken, UserManager), errorHandler(ListController.deleteLists, ListController));

export {routerV1};