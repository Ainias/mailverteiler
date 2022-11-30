import dotenv from "dotenv";

const dev = process.env.NODE_ENV !== 'production'
dotenv.config({"path": dev ? ".env.development": ".env.production"})
dotenv.config({"path": ".env.local"})

import { createServer } from "http";
import next from 'next'
import {prepareServerConnection} from "./src/application/typeorm/prepareServerConnection";
import {UserManager} from "./src/application/UserManagement/UserManager";

const hostname = 'localhost'
const port = 3000
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

async function init(){
    await prepareServerConnection()
    UserManager.init(process.env.PEPPER, process.env.JWT_SECRET)
    const userManager = UserManager.getInstance();
    console.log("User Manager", userManager);

    await app.prepare();
}

async function startup(){
    await init();
    createServer(async (req, res) => {
        try {
            // Be sure to pass `true` as the second argument to `url.parse`.
            // This tells it to parse the query portion of the URL.
            await handle(req, res)
        } catch (err) {
            console.error('Error occurred handling', req.url, err)
            res.statusCode = 500
            res.end('internal server error')
        }
    }).listen(port, (...args) => {
        console.log("LOG-d args", args)
        console.log(`> Ready on http://${hostname}:${port}`)
    })
}

startup();
