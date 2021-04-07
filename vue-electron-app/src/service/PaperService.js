import AxiosService from './AxiosService'
import ibService from './IbService.ts'

const ORDER_API_URL = 'paper/order'
const POSITION_API_URL = 'paper/position'
const ACTIVITY_API_URL = 'paper/activity'
export default {
  placeOrder (data) {
    return AxiosService.post(ORDER_API_URL, {symbol: data.name,
      qty: data.qty,
      side: data.side,
      type: data.type,
      time_in_force: data.time_in_force,
      stop_price: data.stop_price,
      limit_price: data.limit_price,
      extended_hours: data.extended_hours})
  },
  getPositionList () {
    //return AxiosService.get(POSITION_API_URL)
    return ibService.getPosition()
  },
  getActivitesList () {
    //return AxiosService.get(ACTIVITY_API_URL)
    return ibService.getOrderHistory()
  }

}
