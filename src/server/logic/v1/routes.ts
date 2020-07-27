import * as express from 'express';
import {userRoutes, syncRoutes} from "cordova-sites-user-management/dist/server";

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

export {routerV1};