import AxiosService from './AxiosService'

const STOCK_URL = 'stock'
const BARS_URL = STOCK_URL + '/bars'
const SEARCH_URL = STOCK_URL + '/lookup'
export default {
  async getStockInformation (startDate, endDate, symbol, tf) {
    return AxiosService.get(BARS_URL, {
      params: {
        start: startDate,
        end: endDate,
        symbol: symbol,
        timeframe: tf
      }
    })
  },

  async searchStockSymbol (symbol) {
    return AxiosService.get(SEARCH_URL + '?q=' + symbol)
  }
}
