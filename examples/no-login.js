const DeGiro = require('..');

// If you already have the session details from a previous login, you
// can provide them to avoid an extra login.
// You can do that in three ways: 
//     1. constructor
//     2. direct assignment
//     3. environment variables

const degiro = DeGiro.create({
    // sessionId: 'your-session-id',
    // sessionAccount: your-account-number,
});

degiro.login()
    .then(r => console.log(r))
    .then(degiro.getCashFunds)
    .then(data => {
        console.log('EUR:', data.cashFunds.find(cash => cash.name === 'EUR'));
        console.log('USD:', data.cashFunds.find(cash => cash.name === 'USD'));
    })
    .catch(err => console.log(err));
