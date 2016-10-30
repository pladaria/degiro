const DeGiro = require('..');

const degiro = DeGiro.create({username: 'johndoe', password: '1234'});

degiro.login()
    .then(r => console.log(r))
    .catch(err => console.log(err));