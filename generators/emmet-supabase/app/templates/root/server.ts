import {join} from 'path';
import {getApplication, startAPI, WebApiSetup} from '@event-driven-io/emmett-expressjs';
import {glob} from "glob";
import {replayProjection} from "./src/common/replay";
import express, {Application, Request, Response} from 'express';
import {requireUser} from "./src/supabase/requireUser";
import swaggerUi from 'swagger-ui-express'
import {specs} from './src/swagger';
import cors from 'cors';
import {api as replayApi} from "./src/common/routes"

async function startServer() {
    const routesPattern = join(__dirname, 'src/slices/**/routes{,-*}.@(ts|js)');
    const routeFiles = await glob(routesPattern, {nodir: true});
    console.log('Found route files:', routeFiles);

    const processorPattern = join(__dirname, 'src/slices/**/processor{,-*}.@(ts|js)');
    const processorFiles = await glob(processorPattern, {nodir: true});
    console.log('Found processor files:', processorFiles);

    const rootApp: Application = express();

    // Configure CORS to allow requests from localhost:8080 and localhost:8081
    rootApp.use(cors({
        origin: ['http://localhost:8080', 'http://localhost:8081', '*'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization','x-user-id']
    }));

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

    webApis.push(replayApi)

    for (const processorFile of processorFiles) {
        const processor: { processor: { start: () => {} } } = await import(processorFile);
        if (typeof processor.processor.start == "function") {
            console.log(`starting processor ${processorFile}`)
            processor.processor.start()
        }
    }

    // Get the main application from emmett
    const childApp: Application = getApplication({
        apis: webApis,
        disableJsonMiddleware: false,
        enableDefaultExpressEtag: true,
    });

    // Add your custom routes to the main application (BEFORE the catch-all)
    childApp.post("/internal/replay/:slice/:projectionName", async (req: Request, resp: Response) => {
        const {slice, projectionName} = req.params
        await replayProjection(slice, projectionName);
        return resp.status(200).json({status: 'ok'});
    });

    // Protected user info endpoint - requires JWT token in Authorization header
    childApp.get('/api/user', async (req: Request, res: Response) => {
        console.log('API user route hit'); // Debug log
        try {
            const result = await requireUser(req, res, false)
            if (result.error) {
                // Response already sent by requireUser if sendUnauthorized=true
                if (!res.headersSent) {
                    res.status(401).json({error: result.error})
                }
            } else {
                res.status(200).json({
                    userId: result.user.id,
                    email: result.user.email,
                    metadata: result.user.user_metadata
                })
            }
        } catch (error) {
            console.error('Error in /api/user:', error);
            if (!res.headersSent) {
                res.status(500).json({error: 'Internal server error'});
            }
        }
    });

    // Swagger UI endpoints
    childApp.use('/api-docs', swaggerUi.serve);
    childApp.get('/api-docs', swaggerUi.setup(specs, {
        swaggerOptions: {
            urls: [
                {
                    url: '/swagger.json',
                    name: 'JSON',
                },
            ],
        },
    }));

    // OpenAPI spec endpoint
    childApp.get('/swagger.json', (req: Request, res: Response) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(specs);
    });

    const port = parseInt(process.env.PORT || '3000', 10);
    console.log(`> Ready on port ${port}`);

    rootApp.use(childApp)
    // Start the main application
    startAPI(rootApp, {port: port});

    process.on('unhandledRejection', (reason, promise) => {
        console.error('⛔ Unhandled Rejection:', reason);
        if (reason instanceof Error && reason.stack) {
            console.error('Stack trace:\n', reason.stack);
        }
    });
}

startServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});