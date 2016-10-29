const DeGiro = require('..');

const degiro = DeGiro.create({debug: true});

degiro
    .login()
    .then(r => console.log(r))
    .then(() => degiro.buy({
        orderType: DeGiro.OrderTypes.limited,
        productSymbol: 'AAPL',
        productType: DeGiro.ProductTypes.shares,
        size: 1,
        price: 120,
    })
    .then(r => console.log(r)))
    .catch(err => console.log(err));
