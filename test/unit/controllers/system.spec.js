const chai = require('chai');
let sinon = require('sinon');
let sinonChai = require('sinon-chai');
chai.use(sinonChai);
const { mockReq, mockRes } = require('sinon-express-mock');

const { expect } = chai;

describe("system controller", () => {
    let systemController;
    before(() => {
        systemController = require('../../../src/controllers/system');
    });
    describe("getHealth method", () => {
        it("Should check system health", async () => {
            const req = mockReq();
            const res = mockRes();
            await systemController.getHealth(req, res);
            expect(res.status).to.be.calledOnceWith(200);
            expect(res.json).to.be.calledOnceWith({ status: 'OK' });
        });
    });
    describe("getVersion method", () => {
        it("Should return service version", async () => {
            const req = mockReq();
            const res = mockRes();
            await systemController.getVersion(req, res);
            expect(res.status).to.be.calledOnceWith(200);
            expect(res.json).to.be.calledOnceWith({ version: '1.0.0' });
        });
    });
});
