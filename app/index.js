/* initialize models */
require('../db/models/Client');
// const allowedOrigins = require('../config').allowedOrigins;
const express = require('express');
const bodyParser = require('body-parser');
const { clientAPIKeyValidation } = require('./middlewares/clientAPIKeyValidation');
const cors = require('./middlewares/cors');

const app = express();
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

/*  Mandatory Set Up */
app.use(jsonParser);
app.use(urlencodedParser);
app.use(cors);
const generateAPIKey = require('../routes/generateAPIKey');
generateAPIKey(app);

/* Service */
app.use(clientAPIKeyValidation);

// routes
const helloWorld = require('../routes/helloWorld');
helloWorld(app);

module.exports = app;
