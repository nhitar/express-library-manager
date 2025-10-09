const express = require('express');
const server = express();
const routes = require('./routes');
const path = require('path');
const methodOverride = require('method-override');

server.set('view engine', 'pug');
server.set('views', path.join(__dirname, '../views'));

server.use(methodOverride('_method'));
server.use('/css', express.static(path.join(__dirname, '../css')));

server.use('/', routes);
server.listen(3000);