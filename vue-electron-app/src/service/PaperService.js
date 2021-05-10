import ibService from "./IbService.ts";
import confService from "./ConfService";
import alpacaService from "./AlpacaService.ts";

export default {
  /**
   * Place order
   * @param {*} options user's order input 
   * @param {*} data extra information if needed
   */
  placeOrder(options, data) {
    const activeService = confService.getActiveService();
    if (activeService === "IBKR") {
      ibService.placeOrder(options, data.metadata.contract);
    } else if (activeService === "ALPACA") {
      return alpacaService.placeOrder(options);
    }
  },
  /**
   * Get list of positions 
   * @returns promise of list of positions
   */
  getPositionList() {
    const activeService = confService.getActiveService();
    if (activeService === "IBKR") {
      return ibService.getPosition();
    } else if (activeService === "ALPACA") {
      return alpacaService.getPosition();
    }
  },
  /**
   * Get trade activities/order history
   * @returns promise of list of History
   */
  getActivitesList() {
    const activeService = confService.getActiveService();
    if (activeService === "IBKR") {
      return ibService.getOrderHistory();
    } else if (activeService === "ALPACA") {
      return alpacaService.getOrderHistory();
    }
  }
};
