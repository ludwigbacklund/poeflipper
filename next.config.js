require('dotenv').config();

module.exports = {
  env: {
    POESESSID: process.env.POESESSID,
  },
  webpackDevMiddleware: config => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
};
