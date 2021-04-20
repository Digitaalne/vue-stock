import { Position } from '@/interfaces/Position';
import { PriceInterface } from '@/interfaces/PriceInterface';
import { StockMetadata } from '@/interfaces/StockMetadata';
import { History } from '@/interfaces/History';
import { IBApi, EventName, Contract, ErrorCode, Execution, ContractDescription, SecType, TickType, Order, OrderAction, OrderType, OrderState } from '@stoqey/ib'
import store from '../store/index'
import { PriceInterface2 } from '@/interfaces/PriceInterface2';

const CANDLESTICK_SECONDS = 120;
let portString = localStorage.getItem("PORT")
let portNumber;

if(portString == null && localStorage.getItem("SERVICE") === "IBKR") {
 // throw error
} else if (Number(portString) == NaN){
  //throw error
} else if(localStorage.getItem("SERVICE") === "IBKR") {
  portNumber = parseInt(portString!)
}

const barsStoreName = 'socketModule'
const priceStoreName = "prices"
const ib = new IBApi({
  port: portNumber
})

var pricesDict = new Map<number, PriceInterface>()
var tickers = new Map<number, StockMetadata>()

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

function mapToChartFormat(id: number){
  var metadata = tickers.get(id)
  var comparableTime = new Date(metadata?.lastUpdate!)
  comparableTime.setSeconds(metadata!.lastUpdate.getSeconds() + CANDLESTICK_SECONDS)
  console.log(comparableTime)
  console.log(new Date())
  if(new Date() > comparableTime){
    console.log("inside if")
    var lastPriceList = pricesDict.get(id)?.lastPrice
    if(lastPriceList != undefined && lastPriceList.length > 0){
      console.log("inside second if")
      var open = lastPriceList[0]
      var close = lastPriceList[lastPriceList.length-1]
      var high = Math.max(...lastPriceList)
      var low = Math.min(...lastPriceList)
      var date = new Date().getTime()
      var ab = [date, open, high, low, close]
      var cd = [date, 0] 

      metadata!.lastUpdate = new Date();
      pricesDict.get(id)!.lastPrice = []
      
      store.dispatch(barsStoreName + '/socketOnmessage', {
        data: JSON.stringify({[metadata?.contract.symbol!]: {stock_data_list: [ab], stock_volume_list : [cd], metadata: metadata}})
      })
    }
    
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
      var metadata: StockMetadata = 
      {lastUpdate : new Date(),
      contract: contract,
      tickerId: id}
      tickers.set(id, metadata)
      var price: PriceInterface = {askPrice : [],
        bidPrice: [],
        volume: [],
        lastPrice: []}
        pricesDict.set(id,price)
    })
    ib.on(EventName.realtimeBar, (reqId: number, date: number, open: number, high: number, low: number, close: number, volume: number, WAP: number, count: number) => {
      var ab = [date, open, high, low, close]
      var cd = [date, volume]
      store.dispatch(barsStoreName + '/socketOnmessage', {
        data: JSON.stringify({[contract.symbol!]: {stock_data_list: [ab], stock_volume_list : [cd]}})
      })
    })
    ib.on(EventName.tickPrice, (tickerId: number, field: TickType, value: number, attribs: unknown) => {
      var tickList = pricesDict.get(tickerId)
      if(TickType.DELAYED_ASK === field || TickType.ASK === field){
        tickList?.askPrice.push(value)
        let price: PriceInterface2 = {
          askPrice: value,
          name: tickers.get(tickerId)?.contract.symbol!
        }
        store.dispatch(priceStoreName + "/update", price)
      } else if (TickType.BID === field || TickType.DELAYED_BID === field){
        tickList?.bidPrice.push(value)
        let price: PriceInterface2 = {
          bidPrice: value,
          name: tickers.get(tickerId)?.contract.symbol!
        }
        store.dispatch(priceStoreName + "/update", price)
      } else if(TickType.DELAYED_LAST === field || TickType.LAST === field){
        console.log("push " + tickerId)
        tickList?.lastPrice.push(value)
        let price: PriceInterface2 = {
          lastPrice: value,
          name: tickers.get(tickerId)?.contract.symbol!
        }
        store.dispatch(priceStoreName + "/update", price)
        mapToChartFormat(tickerId);
        
      }
     
    })
    ib.on(EventName.tickSize, (tickerId: number, field: TickType, value: number)=> {
      var tickList = pricesDict.get(tickerId)
      if(TickType.RT_TRD_VOLUME === field){
        tickList?.volume.push(value)
        console.log("RTD " + value)
      }
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
    console.log("placed contract ");
    console.log(contract.symbol)
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
    order.transmit = true;
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
      ib.placeOrder(id, contract, order)
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
      ib.once(EventName.nextValidId, (id:number) => {
        ib.reqExecutions(id, new Object());
      })
      ib.on(EventName.execDetails, (reqId: number, contract: Contract, execution: Execution) => {
        var history:History = new Object()
          history.symbol = contract.symbol;
          history.side = execution.side
          history.qty = execution.shares
          history.cum_qty = execution.cumQty;
          history.price = execution.price
          history.transaction_time = new Date(execution.time!)
          response.push(history);
      })
      ib.once(EventName.execDetailsEnd, () => {
        resolve(response)
      })
    })
      ib.reqIds();
      return prom;
  },
  cancelSubscription(tickerId: number){
    ib.cancelMktData(tickerId)
  }
}
