const allowedOrigins = require('../config').allowedOrigins;
const express = require('express');
const bodyParser = require('body-parser');
// routes
const helloWorld = require('../routes/helloWorld');

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

helloWorld(app);

module.exports = app;
