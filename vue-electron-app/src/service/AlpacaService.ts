import { Position } from "@/interfaces/position";
import confService from "../service/confService";
import { History } from "@/interfaces/history";
import store from "../store/index";
import { PriceInterfaceSingle } from "@/interfaces/priceInterfaceSingle";
import axiosService from "./axiosService";
import notificationService from "./notificationService";

const SOCKET_STORE_NAME = "socketModule";
const PRICE_STORE_NAME = "prices";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Alpaca = require("@alpacahq/alpaca-trade-api");
const HISTORIC_BARS_URL = "https://data.alpaca.markets/v2/stocks/{symbol}/bars";
let alpaca: any;
let socket: WebSocket;

let configKeyId: string;
let configSecretKey: string;
let configPaper: string;

/**
 * Initialize connection between app and Alpaca
 */
function init() {
  try {
    configKeyId = confService.getServiceConfiguration("keyId");
    configSecretKey = confService.getServiceConfiguration("secretKey");
    configPaper = confService.getServiceConfiguration("paper");
    alpaca = new Alpaca({
      keyId: configKeyId,
      secretKey: configSecretKey,
      paper: configPaper,
      usePolygon: false
    });
    const authObject = {
      action: "auth",
      key: configKeyId,
      secret: configSecretKey
    };
    if (
      socket !== undefined &&
      (socket.readyState === socket.CONNECTING ||
        socket.readyState === socket.OPEN)
    ) {
      socket.close();
    }
    if (socket === undefined || socket.readyState !== socket.OPEN) {
      socket = new WebSocket("wss://stream.data.alpaca.markets/v2/iex");
    }
    socket.onopen = function(event: any) {
      socket.send(JSON.stringify(authObject));
    };
    socket.onclose = function(event: any) {
      notificationService.notify({
        group: "app",
        text: "Alpaca socket closed",
        type: "warn"
      });
    };

    /**
     * Map incoming data to chart format and dispatch it to store
     * @param event
     */
    socket.onmessage = function(event: any) {
      const eventObject = JSON.parse(event.data);
      for (let i = 0; i < eventObject.length; i++) {
        if (eventObject[i].T === "b") {
          const resp = {
            name: eventObject[i].S,
            stock_data_list: [] as any[],
            stock_volume_list: [] as any[]
          };
          const time = new Date(eventObject[i].t).getTime();
          resp.stock_data_list.push([
            time,
            eventObject[i].o,
            eventObject[i].h,
            eventObject[i].l,
            eventObject[i].c
          ]);
          resp.stock_volume_list.push([time, eventObject[i].v]);
          store.dispatch(SOCKET_STORE_NAME + "/" + "socketOnmessage", {
            data: JSON.stringify({ [resp.name]: resp })
          });
        } else if (eventObject[i].T === "error") {
          console.error(event);
          notificationService.notify({
            group: "app",
            text: "Error with socket has occured",
            type: "error"
          });
        }
      }
    };
    /**
     * Notify user about error
     * @param event
     */
    socket.onerror = function(event) {
      notificationService.notify({
        group: "app",
        text: "Error with socket has occured",
        type: "error"
      });
      console.error(event);
    };
  } catch (error) {
    console.error(error);
    notificationService.notify({
      group: "app",
      text: "Error with Alpaca service init",
      type: "error"
    });
  }
}
if (confService.getActiveService() === "ALPACA") {
  init();
}

export default {
  /**
   * get list of user's positions
   * @returns Promise of list of Positions
   */
  async getPosition(): Promise<Position> {
    return alpaca.getPositions();
  },

  /**
   * Get information for candlestick bars for wanted security.
   *
   * @param stockCode user's input
   */
  async getRealTimeBars(stockCode: string) {
    if (socket.readyState === socket.CLOSED) {
      notificationService.notify({
        group: "app",
        text: "Socket is closed",
        type: "error"
      });
    }
    const barsObject = {
      action: "subscribe",
      bars: [stockCode]
    };
    socket.send(JSON.stringify(barsObject));
    const price2: PriceInterfaceSingle = {
      name: stockCode
    };

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date();
    // Free API requires 15 minute delay
    endDate.setMinutes(endDate.getMinutes() - 15);

    const historic = await this.getHistoricalData(
      startDate.toISOString(),
      endDate.toISOString(),
      stockCode,
      "1Min"
    );
    store.dispatch(SOCKET_STORE_NAME + "/" + "socketOnmessage", {
      data: JSON.stringify({ [stockCode]: historic })
    });
    store.dispatch(PRICE_STORE_NAME + "/update", price2);
  },

  /**
   * Get historic stock price data
   *
   * @param startDate first date of the range
   * @param endDate second date of the range
   * @param symbol stock's symbol
   * @param tf requested timeframe
   * @returns list of bars
   */
  async getHistoricalData(
    startDate: string,
    endDate: string,
    symbol: string,
    tf: string
  ) {
    if (tf === "1D") {
      tf = "1Day";
    }
    const url = HISTORIC_BARS_URL.replace("{symbol}", symbol);
    const bars = await axiosService.get(url, {
      params: {
        start: startDate,
        end: endDate,
        timeframe: tf
      },
      headers: {
        "APCA-API-KEY-ID": configKeyId,
        "APCA-API-SECRET-KEY": configSecretKey
      }
    });
    const resp = {
      name: bars.symbol,
      stock_data_list: [] as any[],
      stock_volume_list: [] as any[]
    };
    for (let i = 0; i < bars.bars.length; i++) {
      const time = new Date(bars.bars[i].t).getTime();
      resp.stock_data_list.push([
        time,
        bars.bars[i].o,
        bars.bars[i].h,
        bars.bars[i].l,
        bars.bars[i].c
      ]);
      resp.stock_volume_list.push([time, bars.bars[i].v]);
    }
    return resp;
  },

  /**
   * Place order for requested security
   *
   * @param data user's input
   * @returns Promise of order
   */
  placeOrder(data: any) {
    return alpaca.createOrder({
      symbol: data.name,
      qty: data.qty,
      side: data.side,
      type: data.type,
      time_in_force: data.time_in_force,
      limit_price: data.limit_price,
      stop_price: data.stop_price,
      extended_hours: data.extended_hours
    });
  },

  /**
   * Get list of order history/trade activities
   * @returns Promise of list of history
   */
  async getOrderHistory(): Promise<History> {
    return alpaca.getAccountActivities({
      activityTypes: ["FILL", "MA", "OPASN", "OPEXP", "OPXRC", "SSO", "SSP"]
    });
  },

  /**
   * Cancel security information subscription
   * @param stockCode unwanted stock
   */
  cancelSubscription(stockCode: string) {
    const cancelSubscription = {
      action: "unsubscribe",
      bars: [stockCode]
    };
    socket.send(JSON.stringify(cancelSubscription));
    store.dispatch(PRICE_STORE_NAME + "/delete", stockCode);
  },

  /**
   * Call out initilization between app and Alpaca
   */
  initialize() {
    init();
  }
};
