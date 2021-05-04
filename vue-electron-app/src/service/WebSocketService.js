import Vue from "vue";
import VueNativeSock from "vue-native-websocket";
import store from "../store/index";

const storeName = "socketModule";
Vue.use(VueNativeSock, "ws://localhost:8080/stock", {
  passToStoreHandler: function(eventName, event) {
    // https://hisk.io/javascript-snake-to-camel/
    const target = eventName.toLowerCase().replace(/([-_][a-z])/g, group =>
      group
        .toUpperCase()
        .replace("-", "")
        .replace("_", "")
    );
    store.dispatch(storeName + "/" + target, event);
  },
  format: "json",
  store: store
});
