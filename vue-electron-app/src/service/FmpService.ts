import axiosService from "./AxiosService.js";
import confService from "../service/ConfService";
const fmpHistoricalUrl = "https://fmpcloud.io/api/v3/historical-chart/";
const fmpHistoricalDayUrl = "https://fmpcloud.io/api/v3/historical-price-full/";
const fmpTickerSearchUrl = "https://fmpcloud.io/api/v3/search";
const fmpStockNewsUrl = "https://fmpcloud.io/api/v3/stock_news";
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
      fmpHistoricalUrl +
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
      fmpHistoricalDayUrl +
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
      fmpTickerSearchUrl +
      "?query=" +
      stock +
      "&limit=10&apikey=" +
      getApiKey();
    return axiosService.get(url);
  },
  getStockNews(stock: string) {
    const url =
      fmpStockNewsUrl + "?tickers=" + stock + "&limit=10&apikey=" + getApiKey();
    return axiosService.get(url);
  }
};
