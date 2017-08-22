const DeGiro = require('..');

const degiro = DeGiro.create({
    // username: 'your-username',
    // password: 'your-password',
});

degiro.login().then(degiro.getClientInfo)
    .then(res => console.log('from network:', res))
    .then(() => console.log('from session:', degiro.session.clientInfo));