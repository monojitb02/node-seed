// swagger-node-runner gets installed as a part of swagger-express-mw
const router = require('swagger-node-runner/fittings/swagger_router');

// Handles Validation errors ands forwards async exceptions to next middleware
// https://itnext.io/using-async-await-to-write-cleaner-route-handlers-7fc1d91b220b
const wrapper = async (ctx, next, nextRouter) => {
    try {
        await nextRouter(ctx, next);
    } catch (e) {
        next(e);
    }
}
module.exports = (fittingDef, next) => {
    const swagger_router = router(fittingDef, next);
    return async (ctx, cb) => {
        return await wrapper(ctx, cb, swagger_router);
    }
}
