const path = require('path');
const express = require('express');
const cors = require('cors');
const apiRouter = require('./routes/api');

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use('/api', apiRouter);
  app.use(express.static(path.join(__dirname, '..', '..', 'public')));

  return app;
}

module.exports = createApp;
