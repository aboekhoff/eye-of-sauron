import React, { Component } from 'react'
import axios from 'axios'
import './App.css'

const INTERVAL = 500

const getTickers = () => {
  return axios.get('/tickers')
}

class App extends Component {
  constructor() {
    super()
    this.state = {
      tickers: {}
    }
  }

  componentDidMount() {
    const poll = () => {
      getTickers()
        .then((res) => {
          this.setState({
            tickers: res.data,
          }, () => {
            setTimeout(poll, INTERVAL)
          })
        })
      }

      poll()
  }

  renderTable(symbol, entry) {
    const exchanges = Object.keys(entry).sort()
    const fields = ['bid', 'ask', 'close']
    const header = [symbol].concat(exchanges).map(ex => <th>{ ex }</th>)
    const body = fields.map(field => <tr><td>{ field }</td>{ exchanges.map(ex => <td>{entry[ex][field]}</td>) }</tr>)

    return (
      <div>
        <table className="ticker-table">
          <thead className="ticker-table-header"><tr>{ header }</tr></thead>
          <tbody className="ticker-table-body">{ body }</tbody>
        </table>
      </div>
    )
  }

  renderTables() {
    const symbols = Object.keys(this.state.tickers).sort()
    return symbols.map(symbol => {
      return this.renderTable(symbol, this.state.tickers[symbol])
    })
  }

  render() {
    return (
      <div className="App">
        <header>
          <h1>Eye-Of-Sauron</h1>
        </header>
        { this.renderTables() }
      </div>
    );
  }
}

export default App;
