const DeGiro = require('..');

const degiro = DeGiro.create({
    // username: 'your-username',
    // password: 'your-password',
});

degiro.login().then(() => degiro.searchProduct({
    text: 'GOOG',
}))
.then(results => console.log(results));
