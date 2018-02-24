const DeGiro = require('..');

// If you already have the session details from a previous login, you
// can provide them to avoid an extra login.
// You can do that in three ways:
//     1. constructor
//     2. direct assignment
//     3. environment variables

const degiro = DeGiro.create({
    // sessionId: 'your session id',
    // sessionAccount: your session account number,
});

(async () => {
    try {
        await degiro.updateConfig(); // needed to update internal configuration
        console.log(await degiro.getPortfolio());
    } catch (e) {
        console.error(e);
    }
})();
