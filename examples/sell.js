const DeGiro = require('..');

// Set your username and password below or run from terminal as:
// DEGIRO_USER=username DEGIRO_PASS=password node examples/buy.js

const degiro = DeGiro.create({
    // username: 'your-username',
    // password: 'your-password',
    debug: true,
});

degiro.login().then(() =>
    degiro.setOrder({
        buySell: DeGiro.Actions.sell,
        orderType: DeGiro.OrderTypes.marketOrder,
        productId: '8066561',
        size: 15,
    })
        .then(console.log)
        .catch(console.error));
