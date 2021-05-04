import AxiosService from "../service/AxiosService";
export default {
  searchStockSymbol(symbol: string) {
    /*     if (symbol.length >= 1) {
       var resp = await stockService.searchStockSymbol(symbol)
       if (symbol.length === 0) return
       if (resp.securities && Array.isArray(resp.securities.security)) {
         possibleSymbols = resp.securities.security.slice(0, 10)
       } else if (
         resp.securities &&
         !Array.isArray(resp.securities.security)
       ) {
         possibleSymbols = [resp.securities.security]
       }
     } else {
       possibleSymbols = []
     } 
     return AxiosService.get(SEARCH_URL + '?q=' + symbol) */
  }
};
