const DeGiro = require('..');

// You can run as:
// DEGIRO_USER=your-username DEGIRO_PASS=your-pass node examples/ask-bid-price.js

// Or enter your login details here:
const degiro = DeGiro.create({
    // username: 'your-username',
    // password: 'your-password',
});

degiro.login().then(() => degiro.getAskBidPrice('350009261'))
    .then(res => console.log(JSON.stringify(res, null, '  ')))
    .catch(console.error);
