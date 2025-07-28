import {Application, Request, Response} from 'express';
import next from 'next';
import {parse} from 'url';
import LoginHandler from "./src/supabase/LoginHandler";
import {join} from 'path';
import {getApplication, startAPI, WebApiSetup} from '@event-driven-io/emmett-expressjs';
import {glob} from "glob";
import {replayProjection} from "./src/common/replay";
import {requireUser} from "./src/supabase/requireUser";

var cookieParser = require('cookie-parser')

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({dev}); // Renamed to avoid confusion
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(async () => {

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

    for (const processorFile of processorFiles) {
        const processor: { processor: { start: () => {} } } = await import(processorFile);
        if (typeof processor.processor.start == "function") {
            console.log(`starting processor ${processorFile}`)
            processor.processor.start()
        }
    }

    // Get the main application from emmett
    const application: Application = getApplication({
        apis: webApis,
        disableJsonMiddleware: false,
        enableDefaultExpressEtag: true,
    });

    // Add cookie parser to the main application
    application.use(cookieParser());

    // Add your custom routes to the main application (BEFORE the catch-all)
    application.post("/internal/replay/:slice/:projectionName", async (req: Request, resp: Response) => {
        const {slice, projectionName} = req.params
        await replayProjection(slice, projectionName);
        return resp.status(200).json({status: 'ok'});
    });

    // Add the user route to the main application
    application.get('/api/user', async (req: Request, res: Response) => {
        console.log('API user route hit'); // Debug log
        try {
            const user = await requireUser(req, res, false)
            if(user.error) {
                res.status(400).send({error: user.error})
            } else {
                res.status(200).send({userId: user.user.userId, email: user.user.email})
            }
        } catch (error) {
            console.error('Error in /api/user:', error);
            res.status(500).send({error: 'Internal server error'});
        }
    });

    application.get("/api/auth/confirm", (req, resp) => {
        return LoginHandler(req, resp)
    });

    // Let Next.js handle all other routes (this should be LAST)
    application.all('*', async (req, res) => {
        console.log(`Handling route: ${req.method} ${req.url}`); // Debug log
        const parsedUrl = parse(req.url!, true)
        return await handle(req, res, parsedUrl);
    });

    const port = parseInt(process.env.PORT || '3000', 10);
    console.log(`> Ready on port ${port}`);

    // Start the main application (not a separate express app)
    startAPI(application, {port: port});

    process.on('unhandledRejection', (reason, promise) => {
        console.error('⛔ Unhandled Rejection:', reason);
        if (reason instanceof Error && reason.stack) {
            console.error('Stack trace:\n', reason.stack);
        }
    });
});