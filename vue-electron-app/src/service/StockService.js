import ibService from './IbService'
import alpacaService from './AlpacaService.ts'
import confService from '../service/ConfService'
import fmpService from './FmpService'

export default {
  async getHistoricStockInformation (startDate, endDate, stock, tf) {
    let activeService = confService.getActiveDataService() 
    if(activeService === "IBKR"){
      return
    } else if(activeService === "ALPACA"){
      return alpacaService.getHistoricalData(startDate, endDate, stock.symbol, tf)
    } else if(activeService === "FMP"){
      return fmpService.getHistoricalData(startDate, endDate, stock.symbol, tf)
    }
  },

  async getStockInformation (stock) {
    let activeService = confService.getActiveDataService() 
    if(activeService === "IBKR"){
      ibService.getRealTimeBars(stock.contract)
    } else if(activeService === "ALPACA"){
      alpacaService.getRealTimeBars(stock.symbol)
    }
    
  },
  async searchStockSymbol (symbol) {
    let activeService = confService.getActiveDataService() 
    if(activeService === "IBKR"){
      if(symbol.length >= 1) {
        var stocks = await ibService.searchStockSymbol(symbol);
        stocks = stocks.slice(0,10)
        let resp = [];
        for (var i = 0; i < stocks.length; i++) {
          let mappedStock = {}
          mappedStock.symbol = stocks[i].contract.symbol;
          mappedStock.description = stocks[i].contract.primaryExch + " " + stocks[i].contract.currency;
          mappedStock.contract = stocks[i].contract;
          resp.push(mappedStock);
        }
        return resp;
      }
    } else if(activeService === "ALPACA"){
      return alpacaService.searchStockSymbol(symbol)
    } else if(activeService === "FMP"){
      console.log("YAAS")
      let symbols = await fmpService.searchStockSymbol(symbol)
      let resp = [];
        for (var i = 0; i < symbols.length; i++) {
          let mappedStock = {}
          mappedStock.symbol = symbols[i].symbol
          mappedStock.description = symbols[i].name + " " + symbols[i].exchangeShortName;
          resp.push(mappedStock);
        }
        return resp
    }
    
    return;
    
  },
  cancelSubscription(data){
    console.log(data)
    let activeService = confService.getActiveDataService() 
    if(activeService === "IBKR"){
      ibService.cancelSubscription(data);
    } else if(activeService === "ALPACA"){
      alpacaService.cancelSubscription(data.name)
    }
  }
}
