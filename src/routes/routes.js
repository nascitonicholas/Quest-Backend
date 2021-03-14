const routes = require('express').Router();
const controller = require('../controllers/controller');

routes.get('/', controller.teste);

module.exports = routes;