const _ = require('lodash');
const logger = require('../logger');
const ValidationError = require('../domain/validation');

const errorHandler = (err, req, res, next) => {
    const availableLogger = req.logger || logger;
    if (!_.isEmpty(err.errors) && (
        err instanceof ValidationError ||
        err.statusCode === 400
    )) {
        availableLogger.warn(`Input Validation Error: ${JSON.stringify(err.errors)}`);
        res.status(400).json({ success: false, errors: err.errors });
    } else {
        const is404 = err.statusCode === 404;
        if (!is404) {
            availableLogger.error(err);
        }
        res.status(err.statusCode || 500).json({
            success: false,
            message: is404 ? 'Not Found' : 'Internal Server Error'
        });
    }
    next();
};
module.exports = errorHandler;