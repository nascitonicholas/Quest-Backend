function Controller(app) {
  this.createPlayer = (req, res) =>
    app.post('/create-player', (req, res) => {
      send(postCreatePlayer(req.body));
      res.status(201).end();
    });
}
module.exports = Controller;