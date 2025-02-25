var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var testAPIRouter = require("./routes/testAPI");
var meetingRouter = require("./routes/meeting");
var surveyRouter = require("./routes/survey");
// makes an express server 
var app = express();
app.use(cors());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../client/build')));

app.use('/api', indexRouter);
app.use('/api/users', usersRouter);
app.use("/api/testAPI", testAPIRouter);
app.use("/api/meeting", meetingRouter)
app.use("/api/survey", surveyRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
// Catch-all handler for client-side routes (for React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
