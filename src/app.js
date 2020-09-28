const { promisify } = require('util');
const express = require('express');
const cors = require('cors')
const Swagger = require('swagger-express-mw');
const mongoose = require('mongoose');
const SwaggerUi = require('swagger-tools/middleware/swagger-ui');
const authMiddleware = require('./middlewares/auth');
const errorHandler = require('./middlewares/errorHandler');
const config = require('./config');
const app = express();

class Application {
    constructor() {
        this.isUp = false;
    }
    async initSwagger() {
        const swaggerCreate = promisify(Swagger.create);
        return await swaggerCreate({
            appRoot: __dirname,
            swaggerFile: `${__dirname}/swagger.yaml`,
            swaggerSecurityHandlers: {
                basicAuth: authMiddleware,
                APIKeyHeader: authMiddleware,
                APIKeyQueryParam: authMiddleware,
            }
        });
    }
    async initDb(connectionUri) {
        mongoose.set('debug', true);
        console.log(connectionUri);
        await mongoose.connect(connectionUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        this.isUp = true;
    }
    async init() {
        app.use(cors());
        // await config.init();
        await this.initDb(config.mongoURI)
        app.enable('trust proxy');
        app.disable('x-powered-by');
        const swaggerExpress = await this.initSwagger();

        swaggerExpress.register(app);
        const {
            ui: uiPath,
            raw: rawPath
        } = swaggerExpress.runner.config.swagger.docEndpoints
        const { basePath } = swaggerExpress.runner.swagger;

        //setup swagger ui
        app.use(SwaggerUi({
            ...swaggerExpress.runner.swagger,
            // securityDefinitions: null
        }, {
            swaggerUi: uiPath, //swagger ui web page
            apiDocs: rawPath, //api document in json format
            swaggerUiDir: `${__dirname}/../static`
        }));

        app.set('productPath', basePath);

        app.get(`${basePath}/`, (req, res) => res.redirect(uiPath));
        app.get('/', (req, res) => res.redirect(uiPath));

        // this needs to registered at the end
        app.use(errorHandler);
        return app;
    }
}

module.exports = new Application();