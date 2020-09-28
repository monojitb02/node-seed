const dotEnv = require('dotenv');
class Config {
    constructor() {
        this.env = process.env.NODE_ENV;
        if (this.env) {
            dotEnv.config({ path: `${__dirname}/../${this.env}.env` });
        }
    }
    get mongoURI() {
        const url = process.env.DB_URL || 'localhost';
        const user = process.env.DB_USER;
        const password = process.env.DB_PASSWORD;

        const isSrv = url.includes('.');
        const prefix = isSrv ? 'mongodb+srv' : 'mongodb';
        const connectionUri = !user || !password ?
            `${prefix}://${url}` :
            `${prefix}://${user}:${password}@${url}`;
        return connectionUri;
    }
    get redisURI() {
        const url = process.env.REDIS_URL || 'localhost';
        const user = process.env.REDIS_USER;
        const password = process.env.REDIS_PASSWORD;

        const connectionUri = !user || !password ?
            `redis://${url}` :
            `redis://${user}:${password}@${url}`;
        return connectionUri;
    }
    get userSessionsTTL() { return 60 * 15 } // 15 idle minutes
    get temporarySessionsTTL() { return 60 * 10 } // 10 minutes
    get sesConfig() {
        return {
            accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
            region: process.env.AWS_SES_REGION || 'eu-west-2',
        }
    }
}
module.exports = new Config();