const db = require('../db');
const app = require('../app');

const thePort = process.env.PORT || 8080;

db.connect()
  .then(() => {
    app.listen(thePort, () => {
      console.log(`the server is listening on port: ${thePort}`)
    })
  })
  .catch(() => {
    console.log('Oops, fail to start the server.')
  })
