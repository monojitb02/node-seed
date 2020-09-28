const chai = require('chai');
let sinon = require('sinon');
let sinonChai = require('sinon-chai');
chai.use(sinonChai);
const { mockReq, mockRes } = require('sinon-express-mock');

const { expect } = chai;

describe.skip("system controller", () => {
    let systemController;
    before(() => {
        systemController = require('../../../src/controllers/hello');
    });
    describe("helloWorld method", () => {
        it("Should say hello", async () => {
            const req = mockReq();
            const res = mockRes();
            await systemController.helloWorld(req, res);
            expect(res.status).to.be.calledOnceWith(200);
            expect(res.json).to.be.calledOnceWith({ message: "Hello World", success: true });
        });
    });
});
