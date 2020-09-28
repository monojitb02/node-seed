const sessionStorage = require('../dal/session.storage');
const securityHandler = (req, res, next) => {
    if (req.swagger.operation['x-anonymous']) {
        next();
        return;
    }
    let sessionToken;
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Basic ')) {
        res.status(401).send();
        return;
    }
    const base64SessionToken = String(req.headers.authorization).trim().substr(6);
    try {
        sessionToken = Buffer.from(base64SessionToken, 'base64').toString();
    } catch (e) {
        console.log('malformed authorization header', req.headers.authorization);
        res.status(401).send();
        return;
    }
    sessionStorage.getSession(sessionToken).then(session => {
        if (!session) {
            res.status(401).send();
            return;
        }
        req.userSession = session;
        req.userSession.sessionToken;
        next();
    });
}
module.exports = securityHandler;