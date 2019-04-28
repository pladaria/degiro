const DeGiro = require('..');

(async () => {
    const degiro = DeGiro.create({
        // username: 'your-username',
        // password: 'your-password',
    });

    await degiro.login();

    console.log(await degiro.getTransactions({year: 2019}));
})();
