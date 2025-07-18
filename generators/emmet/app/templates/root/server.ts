import express, { Request, Response } from 'express';
import next from 'next';
import {NextFunction} from "connect";
import { parse } from 'url';
import LoginHandler from "./src/supabase/LoginHandler";
import { join } from 'path';
import { readdirSync } from 'fs';
import {glob} from "glob";
var cookieParser = require('cookie-parser')

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
    const server = express();

    const routesPattern = join(__dirname, 'src/slices/**/routes.@(ts|js)');
    const routeFiles = await glob(routesPattern, { nodir: true });

    console.log("Applying Cookie Middleware")
    server.use(cookieParser());
    server.use(express.json());


    console.log('Found route files:', routeFiles);

    for (const file of routeFiles) {
        const routeModule = require(file);
        const router = routeModule.default || routeModule;
        if (typeof router === 'function') {
            console.log(`Loading route from ${file}`);
            server.use('/api', router);
        }
    }


    server.all('/', (req, res) => {
        console.log("handling /")
        const parsedUrl = parse(req.url!, true)
        return handle(req, res, parsedUrl);
    });

    server.get("/api/auth/confirm", (req, resp)=>{
        return LoginHandler(req, resp)
    })

    // Let Next.js handle all other routes
    server.all('/*path', (req, res) => {
        //@ts-ignore
        console.log("handling /*path")
        const parsedUrl = parse(req.url!, true)
        return handle(req, res, parsedUrl);
    });



    const port = parseInt(process.env.PORT || '3000', 10);
    server.listen(port, () => {
        console.log(`> Ready on http://localhost:${port}`);
    });
});
