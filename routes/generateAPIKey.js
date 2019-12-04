const { ADMIN_API_KEY } = require('../constants/credentials');
const mongoose = require('mongoose');
const Client = mongoose.model('Client');
const jwt = require('jsonwebtoken');

const generateAPIKey = (app) => {
  app.post('/generate-api-key', async (req, res) => {
    const { adminApiKey, service, organization } = req.body;
    if (!adminApiKey || (adminApiKey && adminApiKey !== ADMIN_API_KEY)) {
      res.status(410).json({
        error: 'Permission Deined'
      });
    } else {
      try {
        const doc = await Client.findOne({ organization, service });
        if (doc) {
          res.status(200).json(doc);
        } else {
          const token = jwt.sign({
            service,
            organization
          }, ADMIN_API_KEY);
          const newDoc = {
            service,
            organization,
            apiKey: token,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          Client.create(newDoc, (err, doc) => {
            console.log('newdoc: ', newDoc);
            if (err) {
              throw new Error(err);
            }
            res.status(200).json(doc);
          });
        }
      } catch (e) {
        return res.status(500).json({ error: 'system error' });
      }
    }
  });
};

module.exports = generateAPIKey;
