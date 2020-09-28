const chai = require('chai');
let sinon = require('sinon');
let sinonChai = require('sinon-chai');
chai.use(sinonChai);
const Express = require('express');

const { expect } = chai;

describe("Application", async () => {
    const app = require('../../../src/app');
    describe("init method", () => {
        it.skip("Should return an express app", async () => {
            const expressApp = await app.init();
            expect(expressApp.constructor.name).to.eql('EventEmitter');
        });
    });
});
