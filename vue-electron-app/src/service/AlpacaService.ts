import { Position } from '@/interfaces/Position';
import TradierService from '../service/TradierService'
import confService from '../service/ConfService'
import { History } from '@/interfaces/History';
import store from '../store/index'
import { PriceInterface2 } from '@/interfaces/PriceInterface2';
import AxiosService from './AxiosService';
const socketStoreName = 'socketModule'
const priceStoreName = "prices"
const Alpaca = require('@alpacahq/alpaca-trade-api')
const historicBarsUrl = 'https://data.alpaca.markets/v2/stocks/{symbol}/bars'
let alpaca:any;
let socket = new WebSocket("wss://stream.data.alpaca.markets/v2/iex")

let configKeyId:string
let configSecretKey:string
let configPaper:string


function init(){
    configKeyId = confService.getServiceConfiguration("keyId")
    configSecretKey = confService.getServiceConfiguration("secretKey")
    configPaper = confService.getServiceConfiguration("paper")
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

    socket.onmessage = function(event:any) {
        let eventObject = JSON.parse(event.data)
        for(let i =0; i < eventObject.length; i++){
            console.log(eventObject)
            if(eventObject[i].T === "b"){
                let resp = {
                    name:eventObject[i].S,
                    stock_data_list: [] as any[],
                    stock_volume_list: [] as any[]
                }
                let time = new Date(eventObject[i].t).getTime()
                resp.stock_data_list.push([time, eventObject[i].o, eventObject[i].h, eventObject[i].l, eventObject[i].c])
                resp.stock_volume_list.push([time, eventObject[i].v])
                store.dispatch(socketStoreName + '/' + "socketOnmessage", {data:JSON.stringify({[resp.name]: resp})})
            } else if (eventObject[i].T === "error"){
                console.error(event)
            }
        }
        
    }
    socket.onerror = function (event) {
        console.error(event)
    }
}
if(confService.getActiveService()==="ALPACA"){
    init()
}

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

    async getHistoricalData (startDate:Date, endDate: Date, symbol:string, tf:string)  {
        console.log(symbol)
        let url = historicBarsUrl.replace('{symbol}', symbol)
     let bars = await AxiosService.get(url, {
      params: {
        start: startDate,
        end: endDate,
        timeframe: tf
      },
      headers: {
        "APCA-API-KEY-ID":  configKeyId,
        "APCA-API-SECRET-KEY": configSecretKey
      }
    }) 
    let resp = {
        name:bars.symbol,
        stock_data_list: [] as any[],
        stock_volume_list: [] as any[]
    }
    console.log(bars.bars.length)
    for(let i = 0; i<bars.bars.length; i++){
        let time = new Date(bars.bars[i].t).getTime()
        resp.stock_data_list.push([time, bars.bars[i].o, bars.bars[i].h, bars.bars[i].l, bars.bars[i].c])
        resp.stock_volume_list.push([time, bars.bars[i].v])
    }
    console.log(resp)
    return resp; /*
    var resp = await alpaca.getBarsV2(
        "AAPL",
        {
            start: "2021-02-01",
            end: "2021-02-10",
            limit: 2,
            timeframe: "1Day",
            adjustment: "all",
        },
        alpaca.configuration
    );
    console.log(resp)
    return resp */
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
       //return symbol
    }

}