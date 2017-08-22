const DeGiro = require('..');

const degiro = DeGiro.create({
    // username: 'johndoe',
    // password: '1234',
});

degiro.login()
    .then(console.log)
    .catch(console.error);
