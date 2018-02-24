const DeGiro = require('..');

// Set your username and password below or run from terminal as:
// DEGIRO_USER=username DEGIRO_PASS=password node examples/buy.js

const degiro = DeGiro.create({
    // username: 'your-username',
    // password: 'your-password',
});

degiro.login().then(() =>
    degiro.setOrder({
        buySell: DeGiro.Actions.buy,
        orderType: DeGiro.OrderTypes.limited,
        productId: '8066561', // Google
        timeType: DeGiro.TimeTypes.permanent,
        size: 1,
        price: 900,
    })
        .then(console.log)
        .catch(console.error));
