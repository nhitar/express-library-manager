const express = require('express');
const server = express();
const routes = require('./routes/routes');
const path = require('path');
const methodOverride = require('method-override');

server.set('view engine', 'pug');
server.set('views', path.join(__dirname, '../client/views'));

server.use(express.urlencoded({ extended: true }));
server.use(methodOverride('_method'));

server.use('/css', express.static(path.join(__dirname, '../../public/css')));
server.use('/favicon', express.static(path.join(__dirname, '../../public/favicon')));

server.use('/', routes);
server.listen(3000);