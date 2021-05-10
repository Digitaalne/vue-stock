import { Position } from "@/interfaces/Position";
import confService from "../service/ConfService";
import { History } from "@/interfaces/History";
import store from "../store/index";
import { PriceInterface2 } from "@/interfaces/PriceInterfaceSingle";
import AxiosService from "./AxiosService";
import notificationService from "./NotificationService";

const SOCKET_STORE_NAME = "socketModule";
const PRICE_STORE_NAME = "prices";

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
        console.log(eventObject);
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
  getRealTimeBars(stockCode: string) {
    if (socket.readyState === socket.CLOSED) {
      notificationService.notify({
        group: "app",
        text: "Socket is closed",
        type: "error"
      });
    }
    console.log(socket);
    const barsObject = {
      action: "subscribe",
      bars: [stockCode]
    };
    console.log(JSON.stringify(barsObject));
    socket.send(JSON.stringify(barsObject));
    const price2: PriceInterface2 = {
      name: stockCode
    };
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
    startDate: Date,
    endDate: Date,
    symbol: string,
    tf: string
  ) {
    console.log(symbol);
    if(tf === "1D"){
      tf = "1Day"
    }
    const url = HISTORIC_BARS_URL.replace("{symbol}", symbol);
    const bars = await AxiosService.get(url, {
      params: {
        start: startDate.toISOString().split("T")[0],
        end: endDate.toISOString().split("T")[0],
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
    console.log(resp);
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
