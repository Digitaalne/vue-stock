import ibService from "./IbService.ts";
import confService from "./ConfService";
import alpacaService from "./AlpacaService.ts";

export default {
  placeOrder(options, data) {
    const activeService = confService.getActiveService();
    if (activeService === "IBKR") {
      ibService.placeOrder(options, data.metadata.contract);
    } else if (activeService === "ALPACA") {
      alpacaService.placeOrder(options);
    }
  },
  getPositionList() {
    const activeService = confService.getActiveService();
    if (activeService === "IBKR") {
      return ibService.getPosition();
    } else if (activeService === "ALPACA") {
      return alpacaService.getPosition();
    }
  },
  getActivitesList() {
    const activeService = confService.getActiveService();
    if (activeService === "IBKR") {
      return ibService.getOrderHistory();
    } else if (activeService === "ALPACA") {
      return alpacaService.getOrderHistory();
    }
  }
};
