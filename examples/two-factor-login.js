const DeGiro = require('..');

// Set your username, password and oneTimePassword (google
// authenticator token) below or run from terminal as:
// DEGIRO_USER=username DEGIRO_PASS=password DEGIRO_ONE_TIME_PASS=token node examples/two-factor-login.js

 const degiro = DeGiro.create({
   //     username: 'john',
   //     password: 'password',
   //     oneTimePassword: '123456'
});

degiro.login()
    .then(console.log)
    .catch(console.error);

