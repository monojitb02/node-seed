
const { getSafeRandomBytes } = require('../util/crypt');
module.exports = class Session {
    constructor(storage) {
        this.sessionStorage = storage;
    }
    async init() {
        this.token = await getSafeRandomBytes(16);
        let collissions = 0;
        while (await this.sessionStorage.get(this.token) && collissions <= 10) {
            collissions++;
            this.token = await getSafeRandomBytes(16);
        }
        if (collissions > 10) {
            throw new Error('too many collissions in sessions Ids');
        }
        return this.token
    }
    async setContent(data) {
        await this.sessionStorage.set(this.token, data);
    }
    getToken() {
        return this.token;
    }
}