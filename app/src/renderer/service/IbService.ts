import { IBApi, EventName, Contract } from '@stoqey/ib'

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

let positionsCount = 0
ib.on(EventName.error, (err : Error, code, reqId) => {
  console.error(`${err.message} - code: ${code} - reqId: ${reqId}`)
})
  .on(EventName.position, (account, contract, pos, avgCost) => {
    console.log(`${account}: ${pos} x ${contract.symbol} @ ${avgCost}`)
    positionsCount++
  })
  .once(EventName.positionEnd, () => {
    console.log(`Total: ${positionsCount} posistions.`)
    ib.disconnect()
  })
ib.connect()
console.log(ib)

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

Object.freeze(ib)
export default {
  getPosition () {
    let posList : Position[]
    ib.on(EventName.position, (account: string, contract: Contract, position: number, avgCost: number) => {
      posList.push(mapToPosition(contract, position, avgCost, account))
    })
      .once(EventName.positionEnd, () => {
        ib.cancelPositions()
        return posList
      })
    ib.reqPositions()
  }
}
