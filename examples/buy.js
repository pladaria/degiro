const DeGiro = require('..');

// Set your username and password below or run from terminal as:
// DEGIRO_USER=username DEGIRO_PASS=password node examples/buy.js

const degiro = DeGiro.create({
    // username: 'your-username',
    // password: 'your-password',
});

degiro.login().then(() => {
    degiro.buy({
        orderType: DeGiro.OrderTypes.limited,
        productSymbol: 'AAPL',
        productType: DeGiro.ProductTypes.shares,
        timeType: DeGiro.TimeTypes.day,
        size: 1,
        price: 110,
    })
    .then(console.log)
    .catch(console.error);
});
