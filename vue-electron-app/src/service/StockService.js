import AxiosService from './AxiosService'
import ibService from './IbService'

const STOCK_URL = 'stock'
const BARS_URL = STOCK_URL + '/bars'
const SEARCH_URL = STOCK_URL + '/lookup'
export default {
  async getStockInformation (startDate, endDate, symbol, tf) {
    /* return AxiosService.get(BARS_URL, {
      params: {
        start: startDate,
        end: endDate,
        symbol: symbol,
        timeframe: tf
      }
    }) */
  },
  async getStockInformation (stock) {
    ibService.getRealTimeBars(stock.contract)
  },
  async searchStockSymbol (symbol) {
    if(symbol.length >= 1) {
      var stocks = await ibService.searchStockSymbol(symbol);
      stocks = stocks.slice(0,10)
      var resp = [];
      for (var i = 0; i < stocks.length; i++) {
        let mappedStock = {}
        mappedStock.symbol = stocks[i].contract.symbol;
        mappedStock.description = stocks[i].contract.primaryExch + " " + stocks[i].contract.currency;
        mappedStock.contract = stocks[i].contract;
        resp.push(mappedStock);
      }
      return resp;
    }
    return;
    //return AxiosService.get(SEARCH_URL + '?q=' + symbol)
   /*  if (this.symbol.length >= 1) {
      var resp = await stockService.searchStockSymbol(this.symbol)
      if (this.symbol.length === 0) return
      if (resp.securities && Array.isArray(resp.securities.security)) {
        this.possibleSymbols = resp.securities.security.slice(0, 10)
      } else if (
        resp.securities &&
        !Array.isArray(resp.securities.security)
      ) {
        this.possibleSymbols = [resp.securities.security]
      }
    } else {
      this.possibleSymbols = []
    } */
  },
  cancelSubscription(data){
    ibService.cancelSubscription(data.metadata.tickerId);
  }
}
