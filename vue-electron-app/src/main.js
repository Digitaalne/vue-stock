import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store/index";
import HighchartsVue from 'highcharts-vue'
import Notifications from 'vue-notification'
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'
import vueDebounce from 'vue-debounce'


Vue.config.productionTip = false;

Vue.use(HighchartsVue)
Vue.use(Notifications)
Vue.use(VueMaterial)
Vue.use(vueDebounce)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
