<template>
  <div id="live" class="container">
    <div>
      <search v-on:stockSearch="findStock($event)"></search>
      <br />
      <div>
<!--         <chart
          v-on:closeChart="deleteChart($event)"
          v-for="(stk, name) in message"
          :key="stk.t"
          v-bind:incData="stk"
          v-bind:name="name"
          v-bind:rangeSelect="rangeSelect"
        ></chart> -->
        <price
          v-for="(stk, name) in stockPrices"
          :key="name"
          v-bind:name="name"
          v-bind:data="stk"
          v-on:closeChart="deleteChart($event)"
        ></price>
      </div>
    </div>
  </div>
</template>

<script>
import stockService from "../service/StockService.js";
import { mapState } from "vuex";
import store from "../store/index";
import search from "../components/Chart/Search.vue";
import price from "../components/Price.vue";

const pricesStoreName = "prices";
export default {
  name: "live",
  components: { search, price },
  data() {
    return {
      stockCode: null,
    }
  },
  methods: {
    findStock: async function (stockCode) {
      if (!stockCode) {
        this.$notify({
          group: "app",
          text: "Missing input",
          type: "warn",
        });
      } else {
        /*  var start = new Date()
        start.setHours(0, 0, 0, 0)
        store.dispatch(pricesStoreName + '/socketOnmessage', {
          data: JSON.stringify(
            await stockService.getStockInformation(
              start,
              new Date(),
              stockCode.trim(),
              '1Min'
            )
          )
        })
        this.$socket.send('s-' + stockCode.trim()) */
        stockService.getStockInformation(stockCode);
      }
    },
    deleteChart(data) {
      // this.$socket.send('u-' + stockCode.trim())
      store.dispatch(pricesStoreName + "/delete", data.metadata.contract.symbol);
      stockService.cancelSubscription(data);
    },
  },
  computed: {
    ...mapState(pricesStoreName, ["stockPrices"]),
  },
  /*   beforeCreate() {
    store.dispatch(pricesStoreName + "/resetState");
  }, */
};
</script>

