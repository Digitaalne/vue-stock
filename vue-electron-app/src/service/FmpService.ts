import axiosService from "./AxiosService.js";
import confService from "../service/ConfService";import store from "../store/index";
import { PriceInterface2 } from "@/interfaces/PriceInterface2.js";
const FMP_HISTORICAL_URL = "https://fmpcloud.io/api/v3/historical-chart/";
const FMP_HISTORICAL_DAY_URL = "https://fmpcloud.io/api/v3/historical-price-full/";
const FMP_TICKER_SEARCH_URL = "https://fmpcloud.io/api/v3/search";
const FMP_STOCK_NEWS_URL = "https://fmpcloud.io/api/v3/stock_news";
const FMP_STOCK_QUOTE_URL = "https://fmpcloud.io/api/v3/quote/"
const STOCK_PRICE_COUNT = 15;
const SOCKET_STORE_NAME = "socketModule";
const PRICE_STORE_NAME = "prices";
const pricesDict = new Map<string, Array<number>>();
const intervalDict = new Map<string, NodeJS.Timeout>();

function convertTimeframe(timeframe: string) {
  if (timeframe === "1Min") {
    return "1min";
  } else if (timeframe === "15Min") {
    return "15min";
  } else if (timeframe === "5Min") {
    return "5min";
  } else if (timeframe === "1D") {
    return "1day";
  }
  return timeframe;
}

function getApiKey() {
  return confService.getDataServiceConfiguration("apiKey");
}

function buildHistoricalDataUrl(
  startDate: Date,
  endDate: Date,
  symbol: string,
  timeframe: string
) {
  const startDateString = startDate.toISOString().split("T")[0];
  const endDateString = endDate.toISOString().split("T")[0];
  if (timeframe !== "1day") {
    return (
      FMP_HISTORICAL_URL +
      timeframe +
      "/" +
      symbol +
      "?" +
      "from=" +
      startDateString +
      "&to=" +
      endDateString +
      "&apikey=" +
      getApiKey()
    );
  } else {
    return (
      FMP_HISTORICAL_DAY_URL +
      symbol +
      "?" +
      "from=" +
      startDateString +
      "&to=" +
      endDateString +
      "&apikey=" +
      getApiKey()
    );
  }
}
async function getRealtimeThingies2(url:string){
  let data = await axiosService.get(url);
  console.log("FMP2", data[0])
  pricesDict.get(data[0].symbol)?.push(data[0].price)
  getRealtimeThingies3(data[0].symbol)
}

function getRealtimeThingies3(stock:string){
  let priceList = pricesDict.get(stock)!
  console.log("FMP2.5", stock)
  console.log("FMP2.6", pricesDict)
  if(priceList.length>=STOCK_PRICE_COUNT){
    console.log("FMP3")
    const open = priceList[0];
    const close = priceList[priceList.length - 1];
    const high = Math.max(...priceList);
    const low = Math.min(...priceList);
    const date = new Date().getTime();
    pricesDict.set(stock, [])
    store.dispatch(SOCKET_STORE_NAME + "/socketOnmessage", {
      data: JSON.stringify({
        [stock]: {
          stock_data_list: [[date, open, high, low, close]],
          stock_volume_list: [[date, 0]],
        }
      })
    });
  }
}

export default {
  async getHistoricalData(
    startDate: Date,
    endDate: Date,
    symbol: string,
    timeframe: string
  ) {
    timeframe = convertTimeframe(timeframe);
    const url = buildHistoricalDataUrl(startDate, endDate, symbol, timeframe);
    let dataObject = await axiosService.get(url);
    dataObject = dataObject.reverse();
    const response = [];
    const volumeResponse = [];
    for (let i = 0; i < dataObject.length; i++) {
      const time = new Date(dataObject[i].date).getTime();
      response.push([
        time,
        dataObject[i].open,
        dataObject[i].high,
        dataObject[i].low,
        dataObject[i].close
      ]);
      volumeResponse.push([time, dataObject[i].volume]);
    }
    return {
      stock_data_list: response,
      stock_volume_list: volumeResponse,
      name: symbol
    };
  },
  searchStockSymbol(stock: string) {
    const url =
      FMP_TICKER_SEARCH_URL +
      "?query=" +
      stock +
      "&limit=10&apikey=" +
      getApiKey();
    return axiosService.get(url);
  },
  getStockNews(stock: string) {
    const url =
      FMP_STOCK_NEWS_URL + "?tickers=" + stock + "&limit=10&apikey=" + getApiKey();
    return axiosService.get(url);
  },
  
  getRealTimeBars(stock: string){
      const url = FMP_STOCK_QUOTE_URL+stock+"?apikey="+getApiKey()
      console.log("1FMP", url)
      pricesDict.set(stock.toUpperCase(), [])
      intervalDict.set(stock.toUpperCase(), setInterval(getRealtimeThingies2.bind(null, url), 1000)) 
      const price2: PriceInterface2 = {
        name: stock
      };
      store.dispatch(PRICE_STORE_NAME + "/update", price2);
  },
  cancelSubscription(stock: string) {
    clearInterval(intervalDict.get(stock)!)
    store.dispatch(PRICE_STORE_NAME + "/delete", stock);
  },
 
};
