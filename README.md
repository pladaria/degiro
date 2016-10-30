# DeGiro API

This is an **unnoficial** Node.js API client for [DeGiro](https://www.degiro.co.uk)'s trading platform. Using this module you can easily automate your orders (buy and sell) and get information about orders, funds or products.

DeGiro is Europe's fastest growing online stockbroker. DeGiro distinguishes itself by offering institutional fees to retail investors. 

## Install

```bash
# using npm
npm install --save degiro

# using yarn
yarn add degiro
```

## Examples

### create

```javascript
const DeGiro = require('degiro');
const degiro = Degiro.create({username: 'johndoe', password: '1234'});
```

You can also provide your user and pass via environment variables:

```javascript
// run as:
// DEGIRO_USER=johndow DEGIRO_PASS=1234 node app.js 

const DeGiro = require('degiro');
// now you don't need to provide your credentials
const degiro = Degiro.create(); 
```

### login

Performs the login to DeGiro using the username and password and 
gets a new session id and the account number.

```javascript
degiro.login().then(session => console.log(session)); 
// prints session info (session id and account number)
```

You can reuse your sessions if you provide the id and account number
via environment variables (`DEGIRO_SID` and `DEGIRO_ACCOUNT`), direct assignment 
or constructor parameters.

```javascript
// set session info via constructor
const degiro = DeGiro.create({sessionId: '', account: 123456})

// set session assigning session variables 
degiro.session.id = 'your-session-id' ;
degiro.session.account = 'your-account-number';
```

### getCashFunds

```javascript
degiro.getCashFunds().then(cash => console.log(cash));
// {
//   cashFunds: [ 
//     {id: '2', name: 'EUR', value: 1935.8, valueBaseCurr: 1935.8, rate: 1},
//     {id: '9885', name: 'USD', value: 0, valueBaseCurr: 0, rate: 0.9102},
//     ...
//   ]
// }
```

### buy

This example sets a permanent buy order 10 Apple shares at a fixed price of $110

```javascript
degiro.buy({
    orderType: DeGiro.OrderTypes.limited,
    productSymbol: 'AAPL',
    productType: DeGiro.ProductTypes.shares,
    timeType: DeGiro.TimeTypes.permanent,
    size: 10,
    price: 110,
}).then(r => console.log(r)); // prints the order id
```

#### options

- `orderType`: _number_
    - DeGiro.OrderTypes.**limited**
    - DeGiro.OrderTypes.**marketOrder**
    - DeGiro.OrderTypes.**stopLoss**
    - DeGiro.OrderTypes.**stopLimited**
- `productSymbol`: _string_
- `productType`: _number_ 
    - DeGiro.ProductTypes.**shares**
    - DeGiro.ProductTypes.**bonds**
    - DeGiro.ProductTypes.**futures**
    - DeGiro.ProductTypes.**options**
    - DeGiro.ProductTypes.**investmendFunds**
    - DeGiro.ProductTypes.**leveragedProducts**
    - DeGiro.ProductTypes.**etfs**
    - DeGiro.ProductTypes.**cfds**
    - DeGiro.ProductTypes.**warrants**
- `timeType`: _number_ 
    - Degiro.TimeTypes.**day**
    - Degiro.TimeTypes.**permanent**
- `price`: _number_  - Required for `limited` and `stopLimited` orders
- `stopPrice`: _number_ - Required for `stopLoss` and `stopLimited` orders    

## sell

This example puts a sell order of 15 Apple shares at market price

```javascript
degiro.sell({
    orderType: DeGiro.OrderTypes.marketOrder,
    productSymbol: 'AAPL',
    productType: DeGiro.ProductTypes.shares,
    size: 15,
}).then(r => console.log(r)); // prints the order id
```

#### options

Same options as `buy`.

## License

MIT
