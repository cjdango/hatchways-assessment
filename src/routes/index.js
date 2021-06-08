const axios = require('axios');
const buildGetPosts = require('./get-posts');
const makeSimpleCache = require('../utils/simple-cache');


const getPosts = buildGetPosts({
  issueHTTPRequest: makeSimpleCache(axios.get, {
    keyPrefix: 'axios',
    makeKey: (_, url) => url,
  })
});

module.exports = {
  getPosts
};