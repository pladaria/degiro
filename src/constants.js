module.exports.Actions = {
    buy: 'BUY',
    sell: 'SELL',
};

module.exports.OrderTypes = {
    limited: 0,
    marketOrder: 2,
    stopLoss: 3,
    stopLimited: 1,
};

module.exports.TimeTypes = {
    day: 1,
    permanent: 3,
};

module.exports.ProductTypes = {
    all: undefined,
    shares: 1,
    bonds: 2,
    futures: 7,
    options: 8,
    investmendFunds: 13,
    leveragedProducts: 14,
    etfs: 131,
    cfds: 535,
    warrants: 536,
};

module.exports.Sort = {
    asc: 'asc',
    desc: 'desc',
};
