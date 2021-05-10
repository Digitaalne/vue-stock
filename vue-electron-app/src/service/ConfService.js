const Conf = require("conf");
const config = new Conf();

export default {
  /**
   * 
   * @returns currently used broker service
   */
  getActiveService() {
    return config.get("service");
  },
  /**
   * 
   * @returns currently used data service
   */
  getActiveDataService() {
    return config.get("dataService");
  },
  /**
   * 
   * @param {*} name configuration name
   * @returns configuration if exists
   */
  getConfiguration(name) {
    return config.get(name);
  },
  /**
   * 
   * @param {*} name configuration name
   * @returns current service configuration
   */
  getServiceConfiguration(name) {
    return config.get(this.getActiveService() + "." + name);
  },
  /**
   * Set currently active service configuration
   * 
   * @param {*} name configuration name
   * @param {*} value configuration value
   */
  setServiceConfiguration(name, value) {
    config.set(this.getActiveService() + "." + name, value);
  },
  /**
   * 
   * @param {*} name configuration name
   * @returns currently active data service configuration
   */
  getDataServiceConfiguration(name) {
    return config.get(this.getActiveDataService() + "." + name);
  },
  /**
   * Set configuration for currently active data service
   * 
   * @param {*} name configuration name
   * @param {*} value configuration value
   */
  setDataServiceConfiguration(name, value) {
    config.set(this.getActiveDataService() + "." + name, value);
  },
   /**
   * Set configuration
   * 
   * @param {*} name configuration name
   * @param {*} value configuration value
   */
  setConfiguration(name, value) {
    config.set(name, value);
  }
};
