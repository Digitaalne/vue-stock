import { Position } from '@/interfaces/Position';
import TradierService from '../service/TradierService'
import confService from '../service/ConfService'
import { History } from '@/interfaces/History';
import store from '../store/index'
import { PriceInterface2 } from '@/interfaces/PriceInterface2';
const socketStoreName = 'socketModule'
const priceStoreName = "prices"
const Alpaca = require('@alpacahq/alpaca-trade-api')
let alpaca:any;
let socket = new WebSocket("wss://stream.data.alpaca.markets/v2/iex")


function init(){
    let configKeyId = confService.getServiceConfiguration("keyId")
    let configSecretKey = confService.getServiceConfiguration("secretKey")
    let configPaper = confService.getServiceConfiguration("paper")
    alpaca = new Alpaca({
        keyId: configKeyId,
        secretKey: configSecretKey,
        paper: configPaper,
        usePolygon: false
      })
    let authObject = {
        action: "auth",
        key: configKeyId,
        secret: configSecretKey
    }
    socket.onopen = function(event:any) {
        socket.send(JSON.stringify(authObject))
    }
    
}
socket.onmessage = function(event:any) {
    let eventObject = JSON.parse(event.data)
    for(let i =0; i < eventObject.length; i++){
        if(eventObject[i].T === "b"){
            store.dispatch(socketStoreName + '/' + "socketOnMessage", eventObject[i])
        } else if (eventObject[i].T === "error"){
            console.error(event)
        }
    }
    
}
socket.onerror = function (event) {
    console.error(event)
}
init()
export default {
    async getPosition () : Promise<Position> {
        return alpaca.getPositions()
    },

    getRealTimeBars (stockCode: string) {
        console.log(socket)
        let barsObject = {
            action: "subscribe",
            bars: [stockCode]
        }
        console.log(JSON.stringify(barsObject))
        socket.send(JSON.stringify(barsObject))
        let price2:PriceInterface2 = {
            name:stockCode
        }
        store.dispatch(priceStoreName + "/update", price2)
    },

    async getHistoricalData (startDate:Date, endDate: Date, symbol:string, timeframe:string)  {
  /*   return AxiosService.get(BARS_URL, {
      params: {
        start: startDate,
        end: endDate,
        symbol: symbol,
        timeframe: tf
      }
    })  */
    return alpaca.getBarsV2(
        symbol,
        {
          start: startDate,
          end: endDate,
          timeframe: timeframe
        })
    },

    placeOrder(data: any){
        return alpaca.createOrder({
            symbol: data.name,
            qty: data.qty, 
            side: data.side,
            type: data.type,
            time_in_force: data.time_in_force,
            limit_price: data.limit_price, 
            stop_price: data.stop_price,
            extended_hours: data.extended_hours,
          })
    },

    async getOrderHistory():Promise<History> {
        return alpaca.getAccountActivities({
            activityTypes: ["FILL", "MA", "OPASN", "OPEXP", "OPXRC", "SSO", "SSP"]
          })
        //return AxiosService.get(ACTIVITY_API_URL)
    },

    cancelSubscription(stockCode:string){
        let cancelSubscription = {
            action: "unsubscribe",
            bars: [stockCode]
        }
        socket.send(JSON.stringify(cancelSubscription))
        store.dispatch(priceStoreName + "/delete", stockCode);
    },

    searchStockSymbol(symbol: string){
        return TradierService.searchStockSymbol(symbol)
    }

}