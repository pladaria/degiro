const DeGiro = require('..');

(async () => {
    const degiro = DeGiro.create({
        // username: 'your-username',
        // password: 'your-password',
    });

    await degiro.login();

    console.log(await degiro.searchProduct({text: 'AAPL'}));
})();
