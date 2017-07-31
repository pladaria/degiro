/// <reference path="../typings/index.d.ts" />

const fetch = require('node-fetch');
const querystring = require('querystring');
const parseCookies = require('cookie').parse;
const {Actions, OrderTypes, TimeTypes, ProductTypes, Sort} = require('./constants');
const omitBy = require('lodash/omitBy');
const omit = require('lodash/omit');
const isNil = require('lodash/isNil');
const fromPairs = require('lodash/fromPairs');

const BASE_URL = 'https://trader.degiro.nl';

const create = ({
    username = process.env.DEGIRO_USER,
    password = process.env.DEGIRO_PASS,
    sessionId = process.env.DEGIRO_SID,
    account = process.env.DEGIRO_ACCOUNT,
    debug = false,
} = {}) => {

    const log = debug ? (...s) => console.log(...s) : () => {};

    const session = {
        id: sessionId,
        account,
        userToken: null,
    };

    const checkSuccess = (res) => {
        if (res.status !== 0) {
            throw Error(res.message);
        }
        return res;
    };

    /**
     * Gets data
     *
     * @return {Promise}
     */
    const getData = (options = {}) => {
        const params = querystring.stringify(options);
        log('getData', params);
        return fetch(`${BASE_URL}/trading/secure/v5/update/${session.account};jsessionid=${session.id}?${params}`)
        .then(res => res.json());
    };

    /**
     * Get current cash funds
     *
     * @return {Promise}
     */
    const getCashFunds = () => {
        return getData({cashFunds: 0}).then(data => {
            if (data.cashFunds && Array.isArray(data.cashFunds.value)) {
                return {cashFunds: data.cashFunds.value.map(({value}) =>
                    omit(fromPairs(value.map(({name, value}) => [name, value])), ['handling', 'currencyCode']))
                };
            }
            throw Error('Bad result: ' + JSON.stringify(data));
        });
    };


    /**
     * Get Product Price Details
     *
     * @return {Promise}
     */
    const getProductPriceDetails = (issueId) => {
        return fetch(`https://charting.vwdservices.com/hchart/v1/deGiro/data.js?requestid=1&resolution=PT1S&culture=nl-BE&period=P1D&series=issueid%3A${issueId}&series=price%3Aissueid%3A${issueId}&format=json&userToken=${session.userToken}&tz=Europe%2FBrussels`)
        .then(res => res.json())
    };


    /**
     * Create a session at VWD services
     *
     * @return {Promise}
     */
    const requestVwdSession = (issueId) => {
        return fetch(`https://degiro.quotecast.vwdservices.com/CORS/request_session?version=1.0.20170315&userToken=${session.userToken}`, {
            method: 'POST',
            headers: { 'Origin': 'https://trader.degiro.nl' },
            body: JSON.stringify({
                "referrer": "https://trader.degiro.nl"
            })
        })
        .then(res => res.json())
    };


    /**
     * Use VWD session to get latest bid/ask prices for a VWD issue ID
     *
     * @return {Promise}
     */
    const getAskBidPrice = (issueId, timesChecked) => {
        timesChecked = timesChecked || 0;

        return requestVwdSession().then(vwdSession => {
            var checkData = function(res) {
                timesChecked++;
                var prices = {};

                //sanity check
                if(!Array.isArray(res)) {
                    throw Error('Bad result: ' + JSON.stringify(res));
                }

                //retry needed?
                if(res.length == 1 && res[0].m == 'h') {
                    if(timesChecked <= 3) {
                        return getAskBidPrice(issueId, timesChecked);
                    }
                    else {
                        throw Error('Tried 3 times to get data, but nothing was returned: ' + JSON.stringify(res));
                    }
                }

                //process incoming data
                var keys = [];
                res.forEach(function(row) {
                    if(row.m == 'a_req') {
                        if(row.v[0].startsWith(issueId)) {
                            function smallFirstLetter(string) {
                                return string.charAt(0).toLowerCase() + string.slice(1);
                            }

                            var key = smallFirstLetter(row.v[0].slice(issueId.length+1));

                            prices[key] = null;
                            keys[row.v[1]] = key;
                        }
                    }
                    else if(row.m == 'un' || row.m == 'us') {
                        prices[keys[row.v[0]]] = row.v[1]
                    }
                });

                //check if everything is there
                if(typeof prices.bidPrice == 'undefined' || typeof prices.askPrice == 'undefined' || typeof prices.lastPrice == 'undefined' || typeof prices.lastTime == 'undefined') {
                    throw Error('Couldn\'t find all requested info: ' + JSON.stringify(res));
                }

                return prices;
            };

            return fetch(`https://degiro.quotecast.vwdservices.com/CORS/${vwdSession.sessionId}`, {
                method: 'POST',
                headers: { 'Origin': 'https://trader.degiro.nl' },
                body: `{"controlData":"req(${issueId}.BidPrice);req(${issueId}.AskPrice);req(${issueId}.LastPrice);req(${issueId}.LastTime);"}`
            })
            .then(function(res) {
                return fetch(`https://degiro.quotecast.vwdservices.com/CORS/${vwdSession.sessionId}`);
            })
            .then(res => res.json())
            .then(checkData)
        });
    };


    /**
     * Get portfolio
     *
     * @return {Promise}
     */
    const getPortfolio = () => {
        return getData({portfolio: 0}).then(data => {
            if (data.portfolio && Array.isArray(data.portfolio.value)) {
                return {portfolio: data.portfolio.value};
            }
            throw Error('Bad result: ' + JSON.stringify(data));
        });
    };

    /**
     * Update client info
     *
     * @return {Promise}
     */
    const updateClientInfo = () => {
        log('updateClientInfo');
        return fetch(`${BASE_URL}/pa/secure/client?sessionId=${session.id}`)
        .then(res => res.json())
        .then(({intAccount, id}) => {
            session.account = intAccount;
            session.userToken = id;
        });
    };

    /**
     * Login
     *
     * @return {Promise} Resolves to {sessionId: string}
     */
    const login = () => {
        log('login', username, '********');
        return fetch(`${BASE_URL}/login/secure/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                "username": username,
                "password": password,
                "isRedirectToMobile": false,
                "loginButtonUniversal": "",
                "queryParams": {"reason": "session_expired"}
            })
        })
        .then(res => {
            const cookies = parseCookies(res.headers.get('set-cookie') || '');
            session.id = cookies.JSESSIONID;
            if (!session.id) {
                throw Error('Login error');
            }
        })
        .then(updateClientInfo)
        .then(() => session);
    };

    /**
     * Search product by name and type
     *
     * @param {string} options.text - Search term. For example: "Netflix" or "NFLX"
     * @param {number} options.productType - See ProductTypes. Defaults to ProductTypes.all
     * @param {number} options.sortColumn - Column to sory by. For example: "name". Defaults to `undefined`
     * @param {number} options.sortType - See SortTypes. Defaults to `undefined`
     * @param {number} options.limit - Results limit. Defaults to 7
     * @param {number} options.offset - Results offset. Defaults to 0
     * @return {Promise} Resolves to {data: Product[]}
     */
    const searchProduct = ({text: searchText, productType = ProductTypes.all, sortColumn, sortType, limit = 7, offset = 0}) => {
        const options = {searchText, productType, sortColumn, sortType, limit, offset};
        const params = querystring.stringify(omitBy(options, isNil));
        log('searchProduct', params);
        return fetch(`${BASE_URL}/product_search/secure/v4/products/lookup?intAccount=${session.account}&sessionId=${session.id}&${params}`)
        .then(res => res.json());
    };


    
    /**
     * Delete order
     *
     * @param {string} order.productId
     * @return {Promise} Resolves to {status: 0, statusText: "success"}
     */
    const deleteOrder = (orderId) => {
        return fetch(`${BASE_URL}/trading_s/secure/v5/order/${orderId};jsessionid=${session.id}?intAccount=${session.account}&sessionId=${session.id}`, {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json;charset=UTF-8'},
            body: JSON.stringify(order),
        })
        .then(res => res.json())
        .then(function(res) {
            if(res.status == 0 && res.statusText == 'success') {
                return true
            } else {
                throw Error('Delete order failed');
            }
        });
    };


    /**
     * Check order
     *
     * @param {number} order.action - See Actions
     * @param {number} order.orderType - See OrderTypes
     * @param {string} order.productId
     * @param {number} order.size
     * @param {number} order.timeType - See TimeTypes
     * @param {number} order.price - Required for limited and stopLimited orders
     * @param {number} order.stopPrice - Required for stopLoss and stopLimited orders
     * @return {Promise} Resolves to {order: Object, confirmationId: string}
     */
    const checkOrder = (order) => {
        const {buysell, orderType, productId, size, timeType, price, stopPrice} = order;
        log('checkOrder', {buysell, orderType, productId, size, timeType, price, stopPrice});
        return fetch(`${BASE_URL}/trading_s/secure/v5/checkOrder;jsessionid=${session.id}?intAccount=${session.account}&sessionId=${session.id}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json;charset=UTF-8'},
            body: JSON.stringify(order),
        })
        .then(res => res.json())
        .then(checkSuccess)
        .then(json => ({order, confirmationId: json.confirmationId}));
    };

    /**
     * Confirm order
     *
     * @param {Object} options.order - As returned by checkOrder()
     * @param {string} options.confirmationId - As returned by checkOrder()
     * @return {Promise} Resolves to {orderId: string}
     */
    const confirmOrder = ({order, confirmationId}) => {
        log('confirmOrder', {order, confirmationId});
        return fetch(`${BASE_URL}/trading_s/secure/v5/order/${confirmationId};jsessionid=${session.id}?intAccount=${session.account}&sessionId=${session.id}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json;charset=UTF-8'},
            body: JSON.stringify(order),
        })
        .then(res => res.json())
        .then(checkSuccess)
        .then(json => ({orderId: json.orderId}));
    };

    /**
     * Returns the first product of a product search response
     *
     * @param {Object} result - Product search result
     * @return {Object} Product record
     */
    const returnFirstProductResult = (result) => {
        if (Array.isArray(result.data) && result.data.length) {
            return result.data[0];
        }
        throw new Error('Product not found');
    };

    /**
     * Buy product
     *
     * @param {number} options.orderType - See OrderTypes
     * @param {string} options.productSymbol - Product symbol. For example: 'AAPL'
     * @param {number} options.productType - See ProductTypes. Defaults to ProductTypes.shares
     * @param {number} options.size - Number of items to buy
     * @param {number} options.timeType - See TimeTypes. Defaults to TimeTypes.day
     * @param {number} options.price
     * @param {number} options.stopPrice
     */
    const buy = ({orderType, productSymbol, productType = ProductTypes.shares, size, timeType = TimeTypes.day, price, stopPrice}) => {
        return searchProduct({text: productSymbol, productType, limit: 1})
        .then(returnFirstProductResult)
        .then(({id}) => order({buysell: Actions.buy, orderType, productId: id, size, timeType, price, stopPrice}));
    };

    /**
     * Sell product
     *
     * @param {number} options.orderType - See OrderTypes
     * @param {string} options.productSymbol - Product symbol. For example: 'AAPL'
     * @param {number} options.productType - See ProductTypes. Defaults to ProductTypes.shares
     * @param {number} options.size - Number of items to buy
     * @param {number} options.timeType - See TimeTypes. Defaults to TimeTypes.day
     * @param {number} options.price
     * @param {number} options.stopPrice
     */
    const sell = ({orderType, productSymbol, productType = ProductTypes.shares, size, timeType = TimeTypes.day, price, stopPrice}) => {
        return searchProduct({text: productSymbol, productType, limit: 1})
        .then(returnFirstProductResult)
        .then(({id}) => order({buysell: Actions.sell, orderType, productId: id, size, timeType, price, stopPrice}));
    };

    /**
     * Check and place Order
     *
     * @param {number} options.buysell - See Actions
     * @param {number} options.orderType - See OrderTypes
     * @param {string} options.productId - Product symbol. For example: 'AAPL'
     * @param {number} options.size - Number of items to buy
     * @param {number} options.timeType - See TimeTypes. Defaults to TimeTypes.day
     * @param {number} options.price
     * @param {number} options.stopPrice
     */
    const order = ({buysell, orderType, productId, size, timeType = TimeTypes.day, price, stopPrice}) => {
        return checkOrder({buysell: buysell, orderType, productId: productId, size, timeType, price, stopPrice})
        .then(confirmOrder);
    };

    return {
        // methods
        login,
        searchProduct,
        buy,
        sell,
        getData,
        getCashFunds,
        getPortfolio,
        getAskBidPrice,
        order,
        deleteOrder,
        // properties
        session,
    };
};

module.exports = {
    create,
    Actions,
    OrderTypes,
    ProductTypes,
    TimeTypes,
    Sort,
};