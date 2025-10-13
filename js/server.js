const express = require('express');
const server = express();
const routes = require('./routes');
const path = require('path');
const methodOverride = require('method-override');

server.set('view engine', 'pug');
server.set('views', path.join(__dirname, '../views'));

server.use(express.urlencoded({ extended: true }));
server.use(methodOverride('_method'));
server.use('/css', express.static(path.join(__dirname, '../css')));

server.use('/font-awesome-4.7.0', express.static(path.join(__dirname, '../font-awesome-4.7.0')));

server.use('/', routes);
server.listen(3000);