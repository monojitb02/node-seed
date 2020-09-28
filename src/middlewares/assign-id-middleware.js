const { v4: uuid } = require('uuid');
/**
 * Assign Activity and trace-level
 */
const assignIdMiddleware = function (req, res, next) {
    let activityId = req.get('x-request-id')
    if (!activityId) {
        activityId = uuid();
        req.headers['x-request-id'] = activityId
    }

    const traceLevel = req.get('x-trace')
    if (!traceLevel) {
        req.headers['x-trace'] = (0).toString()
    }

    next()
}

module.exports = () => (ctx, next) => {
    assignIdMiddleware(ctx.request, ctx.response, next)
}
