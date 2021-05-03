import ibService from './IbService.ts'
import confService from './ConfService'
import alpacaService from './AlpacaService.ts'

export default {
  placeOrder (options, data) {
    let activeService = confService.getActiveService() 
    if(activeService === "IBKR"){
      ibService.placeOrder(options, data.metadata.contract)
    } else if(activeService === "ALPACA"){
      alpacaService.placeOrder(options)
    }
    
  },
  getPositionList () {
    let activeService = confService.getActiveService() 
    if(activeService === "IBKR"){
      return ibService.getPosition()
    } else if(activeService === "ALPACA"){
      return alpacaService.getPosition()
    }

  },
  getActivitesList () {
    let activeService = confService.getActiveService() 
    if(activeService === "IBKR"){
      return ibService.getOrderHistory()
    } else if(activeService === "ALPACA"){
      return alpacaService.getOrderHistory()
    }

  }

}
