const Session = require('./session.base');
const CacheStorage = require('./cache.storage');
const { temporarySessionsTTL } = require('../config');
const sessionStorage = new CacheStorage('tempSesion', temporarySessionsTTL);
module.exports = {
    getNewSession: () => {
        return new Session(sessionStorage);
    },
    async getSession(sessionToken) {
        return await sessionStorage.get(sessionToken);
    },
    async destroy(sessionToken) {
        return await sessionStorage.expire(sessionToken);
    }
}