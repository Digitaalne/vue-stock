import { IBApi, EventName, Contract, ErrorCode } from '@stoqey/ib'

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
  console.error(error.message)
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
    ib.on(EventName.realtimeBar, (reqId: number, date: number, open: number, high: number, low: number, close: number, volume: number, WAP: number, count: number) => {

    })
    ib.reqRealTimeBars(0, contract, 1, 'TRADES', false)
  },
  getHistoricalData (contract: Contract, endDateTime: string, duration: string, timeframe: string) {
    let wafa = new Array()
    let pafa = new Array()
    ib.on(EventName.nextValidId, (id: number) => {
      ib.reqHistoricalData(id, contract, endDateTime, duration, timeframe, 'TRADES', 0, 2, false)
    })
    ib.on(EventName.historicalData, (reqId: number, time: string, open: number, high: number, low: number, close: number, volume: number, count: number, WAP: number, hasGaps: boolean | undefined) => {
     var ab = [time, open, high, low, close]
     var cd = [time, volume]
     wafa.push(ab)
     pafa.push(cd)
    })
    ib.on(EventName.historicalDataEnd, (reqId: number, start: string, end: string) => {
      ib.cancelHistoricalData(reqId);
      return {stock_data_list: wafa, stock_volume_list: pafa}
    })
    ib.reqIds()
  }
}
