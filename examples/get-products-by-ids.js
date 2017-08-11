const DeGiro = require('..');

const degiro = DeGiro.create({
    // username: 'your-username',
    // password: 'your-password',
});

degiro.login().then(() => degiro.getProductsByIds(['8066561', '331868']))
    .then(console.log);
