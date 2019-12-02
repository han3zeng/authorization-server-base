const allowedOrigins = require('../config').allowedOrigins;
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const cors = (req, res, next) => {
  const requsterOrigin = req.header.originl;
  if (allowedOrigins.indexOf(requsterOrigin) > -1) {
    res.header('Access-Control-Allow-Origin', requsterOrigin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
  } else {
    next();
  }
};

app.use(jsonParser);
app.use(urlencodedParser);
app.use(cors);

/* initialize models */
require('../db/models/Client');
// routes
const helloWorld = require('../routes/helloWorld');
const generateAPIKey = require('../routes/generateAPIKey');

helloWorld(app);
generateAPIKey(app);

module.exports = app;
