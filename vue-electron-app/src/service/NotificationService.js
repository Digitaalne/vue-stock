import Vue from "vue";

export default {
  /**
   * Notify user
   *
   * @param {*} settings configuration for notification
   */
  notify(settings) {
    Vue.notify(settings);
  }
};
