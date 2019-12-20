const request = require('supertest');
const expect = require('chai').expect;
const app = require('../app/index.js');
const mongoose = require('mongoose');
// const db = require('../db/index.js');
const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;

const opts = {}; // remove this option if you use mongoose 5 and above

describe('POST generateAPIKey', () => {
  let mongoServer;
  before(async () => {
    mongoServer = new MongoMemoryServer();
    const mongoUri = await mongoServer.getConnectionString();
    await mongoose.connect(mongoUri, opts, (err) => {
      if (err) console.error(err);
    });
  });

  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('OK, generate a APIKey', (done) => {
    request(app).post('/generate-api-key')
      .send({
        service: 'portfolio-and-trial',
        organization: 'hans-lab',
        redirectUrl: 'testurl',
        redirectUrlDeb: 'testurlDEV'
        origin: 'testurl',
        device: 'web',
        adminApiKey: 'TEST_API_KEY'
      })
      .then((res) => {
        const body = res.body;
        expect(body).to.contain.property('_id');
        expect(body).to.contain.property('service');
        expect(body).to.contain.property('organization');
        expect(body).to.contain.property('origin');
        expect(body).to.contain.property('device');
        expect(body).to.contain.property('redirectUrl');
        expect(body).to.contain.property('apiKey');
        expect(body).to.contain.property('createdAt');
        expect(body).to.contain.property('updatedAt');
        done();
      })
      .catch((err) => done(err));
  });
});
