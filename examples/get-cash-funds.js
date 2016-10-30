const DeGiro = require('..');

const degiro = DeGiro.create({
    // username: 'your-username',
    // password: 'your-password',
});

degiro.login().then(degiro.getCashFunds)
    .then(cash => console.log(cash))
    .catch(err => console.log(err));
