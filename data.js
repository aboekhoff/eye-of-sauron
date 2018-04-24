const ccxt = require('ccxt')
const clients = {}
const tickers = {}
const symbolToExchanges = {}

let waiting = 0
let exchangesDidLoadCallback = null

function updateTicker(exchange, symbol, price) {
  const entry = tickers[symbol] || (tickers[symbol] = {})
  entry[exchange] = price
}

function indexify(exchange) {
  const client = clients[exchange]
  clients[exchange].symbols.forEach(symbol => {
    symbolToExchanges[symbol] = symbolToExchanges[symbol] || []
    symbolToExchanges[symbol].push(exchange)
    symbolToExchanges[symbol].sort()
  })
}

function exchangeDidLoad(exchange) {
  waiting--
  console.log(`loaded ${exchange}`)
  if (waiting === 0 && exchangesDidLoadCallback) {
    exchangesDidLoadCallback()
  }
}

function loadExchanges() {
  return new Promise((resolve, reject) => {
    waiting = ccxt.exchanges.length
    exchangesDidLoadCallback = () => { resolve(true) }
    ccxt.exchanges.forEach(loadExchange)
  })
}

function loadExchange(exchange) {
  clients[exchange] = new ccxt[exchange]
  
  clients[exchange].loadMarkets()
    .then(() => {
      indexify(exchange)
      exchangeDidLoad(exchange)
    })
    .catch(err => {
      console.log(err)
      exchangeDidLoad(exchange)
    })
}

function pollTickersForSymbol(symbol, interval) {
  symbolToExchanges[symbol].forEach(exchange => {
    const client = clients[exchange]

    function _fetch() {
      client.fetchTicker(symbol)
        .then(data => {
          updateTicker(exchange, symbol, { 
            bid: data.bid, 
            bidVolume: data.bidVolume,
            ask: data.ask, 
            askVolume: data.askVolume,
            close: data.close 
          })

          if (interval) {
            setTimeout(_fetch, interval)
          }
        })
    }

    _fetch()
  })
}

function pollSymbols(symbols, interval = 500) {
  symbols.forEach(symbol => {
    pollTickersForSymbol(symbol, interval)
  })
}

module.exports = {
  clients,
  tickers,
  symbolToExchanges,
  loadExchanges,
  pollSymbols,
}