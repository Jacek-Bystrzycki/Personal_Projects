const express = require('express');
const routes = express.Router();
const { readQuery, writeQuery } = require('./controllers.js');

routes.route('/read/:dbNo/:start/:size').get(readQuery);
routes.route('/write/:dbNo/:start/:size').put(writeQuery);

module.exports = routes;
