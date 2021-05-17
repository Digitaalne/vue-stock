import ibService from "./ibService";
import alpacaService from "./alpacaService.ts";
import confService from "../service/confService";
import fmpService from "./fmpService";

export default {
  /**
   * Return stock price information in history
   *
   * @param {*} startDate first date of range
   * @param {*} endDate second date of range
   * @param {*} stock requested stock
   * @param {*} tf bar timeframe
   * @returns
   */
  async getHistoricStockInformation(startDate, endDate, stock, tf) {
    const activeService = confService.getActiveDataService();
    if (activeService === "IBKR") {
      return;
    } else if (activeService === "ALPACA") {
      return alpacaService.getHistoricalData(
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0],
        stock.symbol,
        tf
      );
    } else if (activeService === "FMP") {
      return fmpService.getHistoricalData(startDate, endDate, stock.symbol, tf);
    }
  },

  /**
   * Subscribe stock price information as bar
   * @param {} stock requested stock
   */
  async getStockInformation(stock) {
    const activeService = confService.getActiveDataService();
    if (activeService === "IBKR") {
      ibService.getRealTimeBars(stock.contract);
    } else if (activeService === "ALPACA") {
      alpacaService.getRealTimeBars(stock.symbol);
    } else if (activeService === "FMP") {
      fmpService.getRealTimeBars(stock.symbol);
    }
  },
  /**
   * Search possible securities for user. Request it from service and map it to corresponding data format.
   * @param {*} symbol requested security
   * @returns list of possible securities
   */
  async searchStockSymbol(symbol) {
    const activeDataService = confService.getActiveDataService();
    const activeService = confService.getActiveService();
    if (activeDataService === "IBKR" || activeService === "IBKR") {
      if (symbol.length >= 1) {
        let stocks = await ibService.searchStockSymbol(symbol);
        stocks = stocks.slice(0, 10);
        const resp = [];
        for (let i = 0; i < stocks.length; i++) {
          const mappedStock = {};
          mappedStock.symbol = stocks[i].contract.symbol;
          mappedStock.description =
            stocks[i].contract.primaryExch + " " + stocks[i].contract.currency;
          mappedStock.contract = stocks[i].contract;
          resp.push(mappedStock);
        }
        return resp;
      }
    } else if (activeDataService === "ALPACA") {
      return;
    } else if (activeDataService === "FMP") {
      const symbols = await fmpService.searchStockSymbol(symbol);
      const resp = [];
      for (let i = 0; i < symbols.length; i++) {
        const mappedStock = {};
        mappedStock.symbol = symbols[i].symbol;
        mappedStock.description =
          symbols[i].name + " " + symbols[i].exchangeShortName;
        resp.push(mappedStock);
      }
      return resp;
    }

    return;
  },
  /**
   * Cancel security information subscription
   *
   * @param {*} data for cancellation
   */
  cancelSubscription(data) {
    const activeService = confService.getActiveDataService();
    if (activeService === "IBKR") {
      ibService.cancelSubscription(data);
    } else if (activeService === "ALPACA") {
      alpacaService.cancelSubscription(data.name);
    } else if (activeService === "FMP") {
      fmpService.cancelSubscription(data.name);
    }
  },
  /**
   * Get market status. Opened or not
   * @returns information about market
   */
  getMarketStatus(){
    const activeService = confService.getActiveService();
    if (activeService === "ALPACA") {
      return alpacaService.getMarketStatus();
    }
  }
};
