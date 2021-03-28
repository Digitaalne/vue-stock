import { IBApi, EventName, Contract, ErrorCode, ContractDescription, SecType } from '@stoqey/ib'
import store from '../store/index'

const storeName = 'socketModule'
const ib = new IBApi({
  port: 4002
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

ib.connect()
ib.on(EventName.error, (error: Error, code: ErrorCode, reqId: number) => {
  console.error("ERROR: " + error.message + " " + code)
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
    ib.reqMarketDataType(3);
    console.log(contract)
    ib.on(EventName.nextValidId, (id: number) => {
      console.log("1ˇ1111111111111111111111")
      ib.reqRealTimeBars(id, contract, 1, 'TRADES', false)
      console.log("222222222222222222222222")
    })
    ib.on(EventName.realtimeBar, (reqId: number, date: number, open: number, high: number, low: number, close: number, volume: number, WAP: number, count: number) => {
      var ab = [date, open, high, low, close]
      var cd = [date, volume]
      store.dispatch(storeName + '/socketOnmessage', {
        data: JSON.stringify({[contract.symbol!]: {stock_data_list: [ab], stock_volume_list : [cd]}})
      })
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
    ib.on(EventName.nextValidId, (id: number) => {
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
      console.log(contractDescriptions)
      resolve(contractDescriptions);
    })
    })
    ib.reqIds();
    return prom;
  }
}
