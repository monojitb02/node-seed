const util = require('util');
const crypto = require('crypto');
const randomBytesAsync = util.promisify(crypto.randomBytes);
const pbkdf2Async = util.promisify(crypto.pbkdf2);
class Crypts {
    async getSafeRandomBytes(len = 256) {
        const buffer = await randomBytesAsync(len);
        return buffer.toString('hex');
    }
    async encrypt(password, salt) {
        const hash = await pbkdf2Async(password, salt, 1000, 64, `sha512`);
        return hash.toString(`hex`);
    }
    async getSafeRandomKeyPairs() {
        const secret = await this.getSafeRandomBytes(20);
        const salt = await this.getSafeRandomBytes();
        const hash = await this.encrypt(secret, salt);
        return { secret, salt, hash };
    }
}
module.exports = new Crypts();