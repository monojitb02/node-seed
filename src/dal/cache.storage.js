const redis = require('redis');
const { promisify } = require('util');

const config = require('../config');
const client = redis.createClient(config.redisURI);
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const expireAsync = promisify(client.expire).bind(client);

client.on("error", function (error) {
    console.error(error);
});
module.exports = class CacheStorage {
    constructor(storagekey = 'default', ttl = 10) {
        this.storagekey = storagekey;
        this.ttl = ttl;
    }
    getredisKey(key) {
        return `${this.storagekey}-|-${key}`
    }
    async get(key) {
        const redisKey = this.getredisKey(key);
        const value = await getAsync(redisKey);
        if (value !== null) {
            await expireAsync(redisKey, this.ttl);
        }
        if (value) {
            return JSON.parse(value);
        }
        return value
    }
    async set(key, value, ttl) {
        const redisKey = this.getredisKey(key);
        await setAsync(redisKey, JSON.stringify(value));
        const duration = ttl || this.ttl;
        await expireAsync(redisKey, duration);
        return;
    }
    async expire(key) {
        const redisKey = this.getredisKey(key);
        await expireAsync(redisKey, 0);
        return;
    }
}