// fetch.js
//via https://github.com/node-fetch/node-fetch/issues/591#issuecomment-474457866
const fetch = require('node-fetch')

module.exports = (url, args = {}) => {
  args.headers = args.headers || {}
  args.headers['user-agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:74.0) Gecko/20100101 Firefox/74.0'
  return fetch(url, args)
}