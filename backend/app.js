const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const apiRouter = require('./routes/api');
const authRouter = require('./routes/auth');
const { initialize, UPLOAD_DIR } = require('./db');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// Served before the public folder so a volume-backed directory wins at the same URL.
app.use('/uploads', express.static(UPLOAD_DIR));
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database and expose via app.locals
initialize().then((db) => {
  app.locals.db = db;
  console.log('Database initialized');
}).catch((err) => {
  console.error('Database initialization failed:', err);
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter);
app.use('/auth', authRouter);

module.exports = app;
