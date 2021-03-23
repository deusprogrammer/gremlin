var express = require('express');
var path = require('path');
var logger = require('morgan');

var puzzles = require('./routes/puzzles');
var system = require('./routes/system');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/puzzles', puzzles);
app.use('/system', system);

module.exports = app;
