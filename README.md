# DeGiro API

This is an **unofficial** Node.js API client for [DeGiro](https://www.degiro.co.uk)'s trading platform. Using
this module you can easily automate your orders (buy and sell) and get information about orders, funds or
products.

DeGiro is Europe's fastest growing online stockbroker. DeGiro distinguishes itself by offering institutional
fees to retail investors.

:warning: DeGiro could change their API at any moment, if something is not working, please open an issue.

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
const degiro = DeGiro.create({username: 'johndoe', password: '1234'});
```

You can also provide your user and pass via environment variables:

```javascript
// run as:
// DEGIRO_USER=johndoe DEGIRO_PASS=1234 node app.js

const DeGiro = require('degiro');
// now you don't need to provide your credentials
const degiro = DeGiro.create();
```

### login

Performs the login to DeGiro using the username and password and gets a new session id and the account number.

```javascript
degiro.login().then(session => console.log(session));
// prints session info (session id and account number)
```

Two factor authentication is also supported. Pass the 2fa token through javascript or as an environment variable.

```javascript
const DeGiro = require('degiro');
// alternatively run as:
// DEGIRO_USER=johndoe DEGIRO_PASS=1234 DEGIRO_ONE_TIME_PASS=123456 node app.js
const degiro = DeGiro.create({username: 'johndoe', password: '1234', oneTimePassword: '123456'});
```

You can reuse your sessions if you provide the id and account number via environment variables (`DEGIRO_SID`
and `DEGIRO_ACCOUNT`), direct assignment or constructor parameters.

```javascript
// set session info via constructor
const degiro = DeGiro.create({sessionId: '', account: 123456});

// set session assigning session variables
degiro.session.id = 'your-session-id';
degiro.session.account = 'your-account-number';
```

### getCashFunds

```javascript
degiro.getCashFunds().then(console.log);
// {
//   cashFunds: [
//     {id: '2', name: 'EUR', value: 1935.8, valueBaseCurr: 1935.8, rate: 1},
//     {id: '9885', name: 'USD', value: 0, valueBaseCurr: 0, rate: 0.9102},
//     ...
//   ]
// }
```

### getPortfolio

```javascript
degiro.getPortfolio().then(console.log);
// {
//   "portfolio": [
//     {
//       "name": "positionrow",
//       "id": 1156604,
//       "value": [
//         {
//           "name": "id",
//           "value": "1156604",
//           "isAdded": true
//         },
//         {
//           "name": "product",
//           "value": "DEUTSCHE BANK AG COMMO",
//           "isAdded": true
//         },
//         ...
```

### setOrder (buy/sell)

This example sets a permanent buy order 10 Google shares at a fixed price of $900

```javascript
degiro
    .setOrder({
        buySell: DeGiro.Actions.buy,
        orderType: DeGiro.OrderTypes.limited,
        productId: '8066561',
        timeType: DeGiro.TimeTypes.permanent,
        size: 10,
        price: 900,
    })
    .then(console.log); // prints the order id
```

This example sets a sell order of 5 Google shares at market price

```javascript
degiro
    .setOrder({
        buySell: DeGiro.Actions.sell,
        orderType: DeGiro.OrderTypes.marketOrder,
        productId: '8066561',
        size: 5,
    })
    .then(console.log); // prints the order id
```

#### Order options

* `orderType`: _number_
    * DeGiro.OrderTypes.**limited**
    * DeGiro.OrderTypes.**marketOrder**
    * DeGiro.OrderTypes.**stopLoss**
    * DeGiro.OrderTypes.**stopLimited**
* `productId`: _string_
* `timeType`: _number_
    * DeGiro.TimeTypes.**day**
    * DeGiro.TimeTypes.**permanent**
* `price`: _number_ - Required for `limited` and `stopLimited` orders
* `size`: _number_ - Order size
* `stopPrice`: _number_ - Required for `stopLoss` and `stopLimited` orders

### searchProduct

```javascript
degiro.searchProduct({text: 'GOOG'})).then(console.log);
/*
{ offset: 0,
  products:
   [ { vwdIdentifierType: 'issueid',
       productTypeId: 1,
       symbol: 'GOOGL',
       tradable: true,
       marketAllowed: true,
       sellAmountAllowed: true,
       orderBookDepth: 0,
       joinOrderAllowed: false,
       vwdId: '350009261',
       contractSize: 1,
       isFund: false,
       stopLimitOrderAllowed: true,
       putCall: '0',
       currency: 'USD',
       id: '8066561',
       category: 'A',
       limitHitOrderAllowed: false,
       feedQuality: 'D15',
       stoplossAllowed: true,
       name: 'ALPHABET INC. - CLASS',
       gtcAllowed: true,
       exchangeId: '663',
       isin: 'US02079K3059' },
     ...
*/
```

#### Search options

* `text` _string_ - Search term. For example: "Netflix" or "NFLX"
* `productType` _number_ - See `DeGiro.ProductTypes`. Defaults to `all`
* `sortColumn` _number_ - Column to sory by. For example: `'name'`.
* `sortType` _number_
    * DeGiro.SortTypes.**asc**
    * DeGiro.SortTypes.**desc**
* `limit` _number_ - Results limit. Defaults to 7
* `offset` _number_ - Results offset. Defaults to 0

### askBidPrice

```javascript
degiro.getAskBidPrice('350009261').then(console.log);
```

### getProductsById

```javascript
degiro.getProductsByIds(['8066561', '350009261'])).then(console.log);
// displays product details
```

### getClientInfo

Requests client info (name, email, address, role, etc) to the server and updates the session information

```javascript
degiro.getClientInfo().then(console.log);
// displays client information
```

You can also access this information in `degiro.session.clientInfo` after a successful login

## Examples

See [examples](./examples)

## Contributors

* [martijndierckx](https://github.com/martijndierckx)
* [Drag0s](https://github.com/Drag0s)
* [d99kris](https://github.com/d99kris)

## License

MIT
