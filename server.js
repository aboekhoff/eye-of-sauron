const data = require('./data')
const express = require('express')

const app = express()

const symbols = ['BTC/USD', 'ETH/BTC', 'ETH/USD', 'LTC/USD']

app.get('/symbols', (req, res) => {
  res.send(JSON.stringify(Object.keys(data.symbolToExchanges)))
})

app.get('/tickers', (req, res) => {
  res.send(JSON.stringify(data.tickers))
})

data.loadExchanges()
  .then(() => {
    data.pollSymbols(symbols, 2000)
  })

app.listen(4242)