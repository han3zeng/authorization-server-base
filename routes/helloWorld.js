const helloWorld = (app) => {
  app.get('/', (req, res) => {
    res.send('Authorization Sever: Hello World!!!');
  });
};

module.exports = helloWorld;
