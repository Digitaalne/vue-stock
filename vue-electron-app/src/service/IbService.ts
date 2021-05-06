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

const pricesDict = new Map<number, PriceInterface>();
const tickers = new Map<number, StockMetadata>();

/**
 * Initialize IB service and communication with IB gateway
 */
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


/**
 * Map incoming IB data format to position format.
 * 
 * @param contract position contract
 * @param pos user's position
 * @param avgCost average cost of security
 * @param account position's account
 * @returns Position object
 */
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

/**
 * If enough time is passed then map stored information to chart supported format and dispatch it to store.
 * 
 * @param id security request id
 */
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
      const stock_list = [date, open, high, low, close];
      const volume_list = [date, 0];

      const obj = {};
      Object.assign(obj, tickers.get(id));
      tickers.get(id)!.lastUpdate = new Date(); //Issue #24 bug
      pricesDict.get(id)!.lastPrice = [];

      store.dispatch(BARS_STORE_NAME + "/socketOnmessage", {
        data: JSON.stringify({
          [metadata?.contract.symbol!]: {
            stock_data_list: [stock_list],
            stock_volume_list: [volume_list],
            metadata: obj
          }
        })
      });
    }
  }
}

if (confService.getActiveService() === "IBKR") {
  init();
}

export default {
  /**
   * get all user's positions
   * 
   * @returns promise that returns user's positions
   */
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
  /**
   * Get information for candlestick bars for wanted contract.
   * 
   * @param contract findable contract
   */
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
    /**
     * On incoming ticks store information to current security map
     */
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
  /**
   * Search possible suitable securties for current user input
   * 
   * @param pattern user text input
   * @returns list of possible securities
   */
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
  /**
   * Place order for security.
   * 
   * @param input user's options for order
   * @param contract contract for order
   * @returns -
   */
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
    const account = confService.getServiceConfiguration("account")
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
  /**
   * Get list of all possible accounts
   * 
   * @returns promise of list of accounts
   */
  getAllAccounts() {
    const prom = new Promise(function(resolve, reject) {
      ib.on(EventName.managedAccounts, (accountsList: string) => {
        resolve(accountsList.split(","));
      });
    });
    ib.reqManagedAccts();
    return prom;
  },
  /**
   * Get execution history
   * 
   * @returns promise of list of history
   */
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
  /**
   * Cancel security information subscription
   * @param data security information
   */
  cancelSubscription(data: any) {
    store.dispatch(PRICE_STORE_NAME + "/delete", data.metadata.contract.symbol);
    ib.cancelMktData(data.metadata.tickerId);
  },
  /**
   * call out IB gateway connection initialization
   */
  initialize() {
    init();
  }
};
