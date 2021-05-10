import axiosService from "./AxiosService.js";
import confService from "../service/ConfService";
import store from "../store/index";
import { PriceInterface2 } from "@/interfaces/PriceInterfaceSingle.js";
const FMP_HISTORICAL_URL = "https://fmpcloud.io/api/v3/historical-chart/";
const FMP_HISTORICAL_DAY_URL =
  "https://fmpcloud.io/api/v3/historical-price-full/";
const FMP_TICKER_SEARCH_URL = "https://fmpcloud.io/api/v3/search";
const FMP_STOCK_NEWS_URL = "https://fmpcloud.io/api/v3/stock_news";
const FMP_STOCK_QUOTE_URL = "https://fmpcloud.io/api/v3/quote/";
const SOCKET_STORE_NAME = "socketModule";
const PRICE_STORE_NAME = "prices";
/* Interval that corresponds to how many prices goes into one bar */
const STOCK_PRICE_COUNT = 15;

const pricesDict = new Map<string, Array<number>>();
const intervalDict = new Map<string, NodeJS.Timeout>();

/**
 * Convert app timeframe to FMP timeframe
 * @param timeframe app timeframe
 * @returns timeframe suitable for FMP
 */
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

/**
 *
 * @returns api key string
 */
function getApiKey() {
  return confService.getDataServiceConfiguration("apiKey");
}

/**
 * build url responsible for stocks history
 *
 * @param startDate first date of historic data (included)
 * @param endDate last date of historic data (included)
 * @param symbol stock symbol
 * @param timeframe user requested timeframe
 * @returns complete url for request
 */
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

/**
 * If enough information map it to app data structure and dispatch it to store
 * @param stock corresponding stock symbol
 */
function dispatchDataToStore(stock: string) {
  const priceList = pricesDict.get(stock)!;
  if (priceList.length >= STOCK_PRICE_COUNT) {
    const open = priceList[0];
    const close = priceList[priceList.length - 1];
    const high = Math.max(...priceList);
    const low = Math.min(...priceList);
    const date = new Date().getTime();
    pricesDict.set(stock, []);
    store.dispatch(SOCKET_STORE_NAME + "/socketOnmessage", {
      data: JSON.stringify({
        [stock]: {
          stock_data_list: [[date, open, high, low, close]],
          stock_volume_list: [[date, 0]]
        }
      })
    });
  }
}

/**
 * Request stock information and store necessary to map
 * @param url where to pull from
 */
async function pullStock(url: string) {
  const data = await axiosService.get(url);
  pricesDict.get(data[0].symbol)?.push(data[0].price);
  dispatchDataToStore(data[0].symbol);
}

export default {
  /**
   * Get historic stock price data
   *
   * @param startDate first date of the range
   * @param endDate second date of the range
   * @param symbol stock's symbol
   * @param timeframe requested timeframe
   * @returns list of bars
   */
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
  /**
   * Find stocks for user input
   *
   * @param stock user's input
   * @returns list of possible stocks
   */
  searchStockSymbol(stock: string) {
    const url =
      FMP_TICKER_SEARCH_URL +
      "?query=" +
      stock +
      "&limit=10&apikey=" +
      getApiKey();
    return axiosService.get(url);
  },
  /**
   * Get latest news for requested stock
   *
   * @param stock requested stock
   * @returns promise of list of news
   */
  getStockNews(stock: string) {
    const url =
      FMP_STOCK_NEWS_URL +
      "?tickers=" +
      stock +
      "&limit=10&apikey=" +
      getApiKey();
    return axiosService.get(url);
  },

  /**
   * Get information for candlestick bars for wanted stock
   *
   * @param stock requested stock
   */
  getRealTimeBars(stock: string) {
    const url = FMP_STOCK_QUOTE_URL + stock + "?apikey=" + getApiKey();
    pricesDict.set(stock.toUpperCase(), []);
    intervalDict.set(
      stock.toUpperCase(),
      setInterval(pullStock.bind(null, url), 1000)
    );
    const price2: PriceInterface2 = {
      name: stock
    };
    store.dispatch(PRICE_STORE_NAME + "/update", price2);
  },
  /**
   * Delete interval of unwanted stock
   *
   * @param stock to be deleted
   */
  cancelSubscription(stock: string) {
    clearInterval(intervalDict.get(stock)!);
    store.dispatch(PRICE_STORE_NAME + "/delete", stock);
  }
};
