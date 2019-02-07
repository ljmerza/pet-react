var createError = require('http-errors');
var express = require('express');
var logger = require('morgan');
require('dotenv').config();

var indexRouter = require('./routes/index');
var petFinderIndex = require('./routes/pet-finder');
var app = express();

app.use(logger('dev'));
app.use('/', indexRouter);
app.use('/petfinder', petFinderIndex);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  err = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.json(err);
});

module.exports = app;
