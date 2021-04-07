import { IBApi, EventName, Contract, ErrorCode, ExecutionFilter, Execution, ContractDescription, SecType, TickType, Order, OrderAction, OrderType, OrderState } from '@stoqey/ib'
import store from '../store/index'
let portString = localStorage.getItem("PORT")
let portNumber;
if(portString == null && localStorage.getItem("SERVICE") === "IBKR") {
 // throw error
} else if (Number(portString) == NaN){
  //throw error
} else if(localStorage.getItem("SERVICE") === "IBKR") {
  portNumber = parseInt(portString!)
}

const storeName = 'socketModule'
const ib = new IBApi({
  port: portNumber
})

interface Position {
  symbol?: string;
  exchange?: string;
  asset_class?: string;
  avg_entry_price?: number;
  qty?: number;
  market_value?: number;
  cost_basis?: number;
  unrealized_pl?: number;
  unrealized_plpc?: number;
  unrealized_intraday_pl?: number;
  unrealized_intraday_plpc?: number;
  current_price?: number;
  lastday_price?: number;
  change_today?: number;
  account?: string;
}

interface History {
  symbol?: string;
  activity_type?: string;
  cum_qty?: number;
  leaves_qty?: number;
  price?: number;
  qty?: number;
  side?: string;
  type?: string;
  transaction_time?: Date
}

ib.connect()
ib.on(EventName.error, (error: Error, code: ErrorCode, reqId: number) => {
  console.error("ERROR: " + error.message + " " + code + " " + reqId)
})

function mapToPosition (contract: Contract, pos: number, avgCost: number, account: string) : Position {
  return {
    symbol: contract.symbol,
    exchange: contract.exchange,
    asset_class: contract.secType,
    qty: pos,
    avg_entry_price: avgCost,
    account: account
  }
}

// Object.freeze(ib)
export default {
   async getPosition () {
    var prom = new Promise(function(resolve, reject) {
      let posList : Position[] = new Array()
      ib.on(EventName.position, (account: string, contract: Contract, position: number, avgCost: number) => {
        posList.push(mapToPosition(contract, position, avgCost, account))
      })
        .once(EventName.positionEnd, () => {
          ib.cancelPositions()
          resolve(posList)
        })
    })
    ib.reqPositions()
    return prom 
  },
  getRealTimeBars (contract: Contract) {
    contract.exchange = contract.primaryExch
    ib.reqMarketDataType(4);
    console.log(contract)
    ib.once(EventName.nextValidId, (id: number) => {
      //ib.reqRealTimeBars(id, contract, 1, 'TRADES', false)
      ib.reqMktData(id, contract, "", false, false);
    })
    ib.on(EventName.realtimeBar, (reqId: number, date: number, open: number, high: number, low: number, close: number, volume: number, WAP: number, count: number) => {
      var ab = [date, open, high, low, close]
      var cd = [date, volume]
      store.dispatch(storeName + '/socketOnmessage', {
        data: JSON.stringify({[contract.symbol!]: {stock_data_list: [ab], stock_volume_list : [cd]}})
      })
    })
    ib.on(EventName.tickPrice, (tickerId: number, fields: TickType, value: number, attribs: unknown) => {
      console.log((TickType.DELAYED_LAST === fields) + " " + value + " " +contract.symbol + " " + attribs) 
    })
    ib.on(EventName.tickSize, (tickerId: number, field: TickType, value: number)=> {
      console.log(field + " " + value)
    })
    ib.reqIds();
    
  },
  getHistoricalData (contract: Contract, endDateTime: string, duration: string, timeframe: string) {
    let cont:Contract = new Object();
    cont.conId=36285627;
    cont.currency = "USD";
    cont.secType = SecType.STK;
    cont.symbol = "GME";
    cont.exchange = "NYSE"

    let wafa = new Array()
    let pafa = new Array()
    ib.once(EventName.nextValidId, (id: number) => {
      ib.reqHistoricalData(id, cont, endDateTime, duration, timeframe, 'TRADES', 0, 2, false)
    })
    ib.on(EventName.historicalData, (reqId: number, time: string, open: number, high: number, low: number, close: number, volume: number, count: number, WAP: number, hasGaps: boolean | undefined) => {
     var ab = [time, open, high, low, close]
     var cd = [time, volume]
     console.log(ab)
     console.log(cd)
     wafa.push(ab)
     pafa.push(cd)
    })
    ib.on(EventName.historicalDataEnd, (regId: number, start: string, end:string) => {
      ib.cancelHistoricalData(regId);
      console.log(wafa)
      console.log(pafa)
      return {wafa, pafa}
    })
  
    ib.reqIds()
  },
  searchStockSymbol(pattern: string) {
    var prom = new Promise(function(resolve, reject) {
    ib.once(EventName.nextValidId, (id: number) => {
      ib.reqMatchingSymbols(id, pattern)
    })
    ib.once(EventName.symbolSamples, (reqId: number, contractDescriptions: ContractDescription[]) => {
      resolve(contractDescriptions); 
    })
  
    })
    ib.reqIds();
    return prom;
  },
  placeOrder(input: any, contract: Contract){
    console.log("hi")
    let cont:Contract = new Object();
    cont.conId=36285627;
    cont.currency = "USD";
    cont.secType = SecType.STK;
    cont.symbol = "GME";
    cont.exchange = "NYSE"

    var order: Order = new Object()

    switch(input.type) {
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
    switch(input.side) {
      case "buy":
        order.action = OrderAction.BUY;
        break;
      case "sell":
        order.action = OrderAction.SELL;
        break;
    }

    order.totalQuantity = input.qty;
    order.orderType = OrderType.MKT;
    order.lmtPrice = input.limit_price;
    order.auxPrice = input.stop_price;
    order.tif = input.time_in_force;
    var account = localStorage.getItem("ACCOUNT")
    if(account == null) {
      //TODO:: Throw error
        return;
    }
    order.account = account
    ib.once(EventName.nextValidId, (id:number) => {
      ib.placeOrder(id, cont, order)
    })
    ib.on(EventName.openOrder, (orderId: number, contract: Contract, order: Order, orderState: OrderState)  => {
      console.log("status " + orderState.status)
    })
    ib.on(EventName.orderStatus, (orderId: number, apiClientId: number, apiOrderId: number, whyHeld: string, mktCapPrice: number) => {
      console.log("oid " + orderId)
    })
  
    ib.reqIds();
  },
  getAllAccounts(){
    var prom =  new Promise(function(resolve, reject) {
    ib.on(EventName.managedAccounts, (accountsList: string) => {
        resolve(accountsList.split(","))
      })
    });
    ib.reqManagedAccts();
    return prom;
  },
  getOrderHistory(){
    var response: History[] = new Array()
    var prom = new Promise(function(resolve, reject) {
      ib.on(EventName.completedOrder, (contract: Contract, order: Order, orderState: OrderState) => {
          var history:History = new Object()
          history.symbol = contract.symbol;
          history.side = order.action
          history.qty = order.filledQuantity
          history.price = order.lmtPrice
          history.transaction_time = new Date(orderState.completedTime!)
          response.push(history);
          console.log(contract, order, orderState)
      })
      ib.once(EventName.completedOrdersEnd, () => {
          resolve(response)
      }) 
    })
      ib.reqCompletedOrders(false);
      ib.reqAllOpenOrders();
      ib.reqExecutions(0, new Object());
      return prom;
  }
}
