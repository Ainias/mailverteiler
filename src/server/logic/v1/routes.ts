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
routerV1.post("/maillist", errorHandler(UserManager.setUserFromToken, UserManager), errorHandler(ListController.modifyList, ListController));

export {routerV1};