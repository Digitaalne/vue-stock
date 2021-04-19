<template>
  <div id="live" class="container">
    <div>
      <search v-on:stockSearch="findStock($event)"></search>
      <br />
      <div>
        <chart
          v-on:closeChart="deleteChart($event)"
          v-for="(stk, name) in message"
          :key="stk.t"
          v-bind:incData="stk"
          v-bind:name="name"
          v-bind:rangeSelect="rangeSelect"
        ></chart>
      </div>
    </div>
  </div>
</template>

<script>
import stockService from "../service/StockService.js";
import chart from "../components/Chart/Chart.vue";
import { mapState } from "vuex";
import store from "../store/index";
import search from "../components/Chart/Search.vue";

const storeName = "socketModule";
export default {
  name: "live",
  components: { chart, search },
  data() {
    return {
      stockCode: null,
      rangeSelect: {
        buttons: [
          {
            type: "hour",
            count: 1,
            text: "1h",
          },
          {
            type: "day",
            count: 1,
            text: "1D",
          },
        ],
        selected: 1,
        inputEnabled: false,
      },
    };
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
        store.dispatch(storeName + '/socketOnmessage', {
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
      store.dispatch(storeName + "/unsubscribe", data.metadata.contract.symbol);
      stockService.cancelSubscription(data);
    },
  },
  computed: {
    ...mapState(storeName, ["message"]),
  },
  /*   beforeCreate() {
    store.dispatch(storeName + "/resetState");
  }, */
};
</script>

