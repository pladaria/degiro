const DeGiro = require('..');

const degiro = DeGiro.create({
    // username: 'your-username',
    // password: 'your-password',
});

degiro
    .login()
    .then(degiro.getPortfolio)
    .then(res => console.log(JSON.stringify(res, null, '  ')))
    .catch(console.error);
