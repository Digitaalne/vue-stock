import { Position } from "@/interfaces/Position";
import { PriceInterface } from "@/interfaces/PriceInterface";
import { StockMetadata } from "@/interfaces/StockMetadata";
import { History } from "@/interfaces/History";
import {
  IBApi,
  EventName,
  Contract,
  ErrorCode,
  Execution,
  ContractDescription,
  SecType,
  TickType,
  Order,
  OrderAction,
  OrderType,
  OrderState
} from "@stoqey/ib";
import store from "../store/index";
import { PriceInterface2 } from "@/interfaces/PriceInterfaceSingle";
import confService from "../service/ConfService";
import notificationService from "./NotificationService";

const CANDLESTICK_SECONDS = 60;

const BARS_STORE_NAME = "socketModule";
const PRICE_STORE_NAME = "prices";
let ib: IBApi;

function init() {
  const portString = confService.getServiceConfiguration("port");
  ib = new IBApi({
    port: Number(portString)
  });
  ib.connect();

  ib.on(EventName.error, (error: Error, code: ErrorCode, reqId: number) => {
    notificationService.notify({
      group: "app",
      text: error.message,
      type: "error"
    });
    console.error("ERROR: " + error.message + " " + code + " " + reqId);
  });
}

const pricesDict = new Map<number, PriceInterface>();
const tickers = new Map<number, StockMetadata>();

if (confService.getActiveService() === "IBKR") {
  init();
}

function mapToPosition(
  contract: Contract,
  pos: number,
  avgCost: number,
  account: string
): Position {
  return {
    symbol: contract.symbol,
    exchange: contract.exchange,
    asset_class: contract.secType,
    qty: pos,
    avg_entry_price: avgCost,
    account: account
  };
}

function mapToChartFormat(id: number) {
  const metadata = tickers.get(id);
  const comparableTime = new Date(metadata?.lastUpdate!);
  comparableTime.setSeconds(
    metadata!.lastUpdate.getSeconds() + CANDLESTICK_SECONDS
  );
  if (new Date() > comparableTime) {
    const lastPriceList = pricesDict.get(id)?.lastPrice;
    if (lastPriceList != undefined && lastPriceList.length > 0) {
      const open = lastPriceList[0];
      const close = lastPriceList[lastPriceList.length - 1];
      const high = Math.max(...lastPriceList);
      const low = Math.min(...lastPriceList);
      const date = new Date().getTime();
      const ab = [date, open, high, low, close];
      const cd = [date, 0];

      const obj = {};
      Object.assign(obj, tickers.get(id));
      tickers.get(id)!.lastUpdate = new Date(); //Issue #24 bug
      pricesDict.get(id)!.lastPrice = [];

      store.dispatch(BARS_STORE_NAME + "/socketOnmessage", {
        data: JSON.stringify({
          [metadata?.contract.symbol!]: {
            stock_data_list: [ab],
            stock_volume_list: [cd],
            metadata: obj
          }
        })
      });
    }
  }
}

export default {
  async getPosition() {
    const prom = new Promise(function(resolve, reject) {
      const posList: Position[] = [];
      ib.on(
        EventName.position,
        (
          account: string,
          contract: Contract,
          position: number,
          avgCost: number
        ) => {
          posList.push(mapToPosition(contract, position, avgCost, account));
        }
      ).once(EventName.positionEnd, () => {
        ib.cancelPositions();
        resolve(posList);
      });
    });
    ib.reqPositions();
    return prom;
  },
  getRealTimeBars(contract: Contract) {
    contract.exchange = "SMART";
    ib.reqMarketDataType(4);
    console.log(contract);
    ib.once(EventName.nextValidId, (id: number) => {
      ib.reqMktData(id, contract, "", false, false);

      const metadata: StockMetadata = {
        lastUpdate: new Date(),
        contract: contract,
        tickerId: id
      };

      tickers.set(id, metadata);

      const price: PriceInterface = {
        askPrice: [],
        bidPrice: [],
        volume: [],
        lastPrice: []
      };
      pricesDict.set(id, price);

      const price2: PriceInterface2 = {
        name: contract.symbol!,
        metadata: metadata
      };

      store.dispatch(PRICE_STORE_NAME + "/update", price2);
    });
    ib.on(
      EventName.tickPrice,
      (tickerId: number, field: TickType, value: number, attribs: unknown) => {
        const tickList = pricesDict.get(tickerId);
        if (TickType.DELAYED_ASK === field || TickType.ASK === field) {
          tickList?.askPrice.push(value);
          const price: PriceInterface2 = {
            askPrice: value,
            name: tickers.get(tickerId)?.contract.symbol!
          };
          store.dispatch(PRICE_STORE_NAME + "/update", price);
        } else if (TickType.BID === field || TickType.DELAYED_BID === field) {
          tickList?.bidPrice.push(value);
          const price: PriceInterface2 = {
            bidPrice: value,
            name: tickers.get(tickerId)?.contract.symbol!
          };
          store.dispatch(PRICE_STORE_NAME + "/update", price);
        } else if (TickType.DELAYED_LAST === field || TickType.LAST === field) {
          console.log("push " + tickerId);
          tickList?.lastPrice.push(value);
          const price: PriceInterface2 = {
            lastPrice: value,
            name: tickers.get(tickerId)?.contract.symbol!
          };
          store.dispatch(PRICE_STORE_NAME + "/update", price);
          mapToChartFormat(tickerId);
        }
      }
    );
    ib.reqIds();
  },
  searchStockSymbol(pattern: string) {
    const prom = new Promise(function(resolve, reject) {
      ib.once(EventName.nextValidId, (id: number) => {
        ib.reqMatchingSymbols(id, pattern);
      });
      ib.once(
        EventName.symbolSamples,
        (reqId: number, contractDescriptions: ContractDescription[]) => {
          resolve(contractDescriptions);
        }
      );
    });
    ib.reqIds();
    return prom;
  },
  placeOrder(input: any, contract: Contract) {
    console.log("placed contract ");
    console.log(contract);
    const order: Order = new Object();

    switch (input.type) {
      case "market":
        order.orderType = OrderType.MKT;
        break;
      case "limit":
        order.orderType = OrderType.LMT;
        break;
      case "stop":
        order.orderType = OrderType.STP;
        break;
      case "stop_limit":
        order.orderType = OrderType.STP_LMT;
        break;
    }
    switch (input.side) {
      case "buy":
        order.action = OrderAction.BUY;
        break;
      case "sell":
        order.action = OrderAction.SELL;
        break;
    }
    order.transmit = true;
    order.totalQuantity = input.qty;
    order.orderType = OrderType.MKT;
    order.lmtPrice = input.limit_price;
    order.auxPrice = input.stop_price;
    order.tif = input.time_in_force;
    const account = localStorage.getItem("ACCOUNT");
    if (account == null) {
      notificationService.notify({
        group: "app",
        text: "Please choose account!",
        type: "warn"
      });
      return;
    }
    order.account = account;
    ib.once(EventName.nextValidId, (id: number) => {
      ib.placeOrder(id, contract, order);
    });
    ib.on(
      EventName.openOrder,
      (
        orderId: number,
        contract: Contract,
        order: Order,
        orderState: OrderState
      ) => {
        notificationService.notify({
          group: "app",
          text: "Order: " + orderId + " state:" + orderState.status,
          type: "info"
        });
        console.log("status " + orderState.status);
      }
    );

    ib.reqIds();
  },
  getAllAccounts() {
    const prom = new Promise(function(resolve, reject) {
      ib.on(EventName.managedAccounts, (accountsList: string) => {
        resolve(accountsList.split(","));
      });
    });
    ib.reqManagedAccts();
    return prom;
  },
  getOrderHistory() {
    const response: History[] = [];
    const prom = new Promise(function(resolve, reject) {
      ib.once(EventName.nextValidId, (id: number) => {
        ib.reqExecutions(id, new Object());
      });
      ib.on(
        EventName.execDetails,
        (reqId: number, contract: Contract, execution: Execution) => {
          const history: History = new Object();
          history.symbol = contract.symbol;
          history.side = execution.side;
          history.qty = execution.shares;
          history.cum_qty = execution.cumQty;
          history.price = execution.price;
          history.transaction_time = new Date(execution.time!);
          response.push(history);
        }
      );
      ib.once(EventName.execDetailsEnd, () => {
        resolve(response);
      });
    });
    ib.reqIds();
    return prom;
  },
  cancelSubscription(data: any) {
    store.dispatch(PRICE_STORE_NAME + "/delete", data.metadata.contract.symbol);
    ib.cancelMktData(data.metadata.tickerId);
  },
  initialize() {
    init();
  }
};
