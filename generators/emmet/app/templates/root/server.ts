import {Application, Request, Response} from 'express';
import next from 'next';
import {parse} from 'url';
import LoginHandler from "./src/supabase/LoginHandler";
import {join} from 'path';
import {getApplication, startAPI, WebApiSetup} from '@event-driven-io/emmett-expressjs';
import {glob} from "glob";
import {replayProjection} from "./src/common/replay";


var cookieParser = require('cookie-parser')

const dev = process.env.NODE_ENV !== 'production';
const app = next({dev});
const handle = app.getRequestHandler();

app.prepare().then(async () => {

    const routesPattern = join(__dirname, 'src/slices/**/routes{,-*}.@(ts|js)');
    const routeFiles = await glob(routesPattern, {nodir: true});
    console.log('Found route files:', routeFiles);

    const processorPattern = join(__dirname, 'src/slices/**/processor{,-*}.@(ts|js)');
    const processorFiles = await glob(processorPattern, {nodir: true});
    console.log('Found processor files:', processorFiles);

    const webApis: WebApiSetup[] = [];

    for (const file of routeFiles) {
        const webApiModule: { api: () => WebApiSetup } = await import(file);
        if (typeof webApiModule.api == 'function') {
            var module = webApiModule.api()
            webApis.push(module);
        } else {
            console.error(`Expected api function to be defined in ${file}`);
        }
    }

    for(const processorFile of processorFiles) {
        const processor: { processor: {start: () => {}} } = await import(processorFile);
        if (typeof processor.processor.start == "function") {
            console.log(`starting processor ${processorFile}`)
            processor.processor.start()
        }
    }

    const express = require('express');
    const app = express();

    app.post("/internal/replay/:slice/:projectionName", async (req:Request, resp:Response)=>{
        const {slice, projectionName} = req.params
        await replayProjection(slice, projectionName);
        return resp.status(200).json({ status: 'ok' });
    })

    app.use(cookieParser());

    const application: Application = getApplication({
        apis: webApis,
        disableJsonMiddleware: false,
        enableDefaultExpressEtag: true,
    });

    app.use(application);

    app.all('/', (req: Request, res: Response) => {
        console.log("handling /")
        const parsedUrl = parse(req.url!, true)
        return handle(req, res, parsedUrl);
    });

    application.get("/api/auth/confirm", (req:Request, resp:Response) => {
        return LoginHandler(req, resp)
    })

    // Let Next.js handle all other routes
    application.all('*', async (req: Request, res:Response) => {
        //@ts-ignore
        const parsedUrl = parse(req.url!, true)
        return await handle(req, res, parsedUrl);
    });

    const port = parseInt(process.env.PORT || '3000', 10);
    console.log(`> Ready on port ${port}`);
    startAPI(app, {port: port});

});
