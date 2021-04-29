import ibService from './IbService'
import alpacaService from './AlpacaService.ts'
import confService from '../service/ConfService'

export default {
  async getStockInformation (startDate, endDate, symbol, tf) {
    let activeService = confService.getActiveService() 
    if(activeService === "IBKR"){
      return
    } else if(activeService === "ALPACA"){
      alpacaService.getHistoricalData(startDate, endDate, symbol, tf)
    }
    //TODO:: ADD
  },
  async getStockInformation (stock) {
    let activeService = confService.getActiveService() 
    if(activeService === "IBKR"){
      ibService.getRealTimeBars(stock.contract)
    } else if(activeService === "ALPACA"){
      console.log(stock)
      alpacaService.getRealTimeBars(stock.symbol)
    }
    
  },
  async searchStockSymbol (symbol) {
    let activeService = confService.getActiveService() 
    if(activeService === "IBKR"){
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
    } else if(activeService === "ALPACA"){
      return alpacaService.searchStockSymbol(symbol)
    }
    
    return;
    
  },
  cancelSubscription(data){
    let activeService = confService.getActiveService() 
    if(activeService === "IBKR"){
      ibService.cancelSubscription(data.metadata.tickerId);
    } else if(activeService === "ALPACA"){
      alpacaService.cancelSubscription()
    }
  }
}
