const logger = require('../logger');

const logEntryMiddleware = function (req, res, next) {
    // Don't log system endpoint
    if (req.swagger.operation['x-system']) {
        next();
        return;
    }
    logger.info('Request received by service', {
        Url: req.originalUrl.toLowerCase(),
        ActivityId: req.get('x-request-id')
    });
    next();
}

module.exports = () => (ctx, next) => {
    logEntryMiddleware(ctx.request, ctx.response, next)
}
