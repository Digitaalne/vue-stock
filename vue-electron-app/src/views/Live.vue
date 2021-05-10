<template>
  <div id="live" class="container">
    <div>
      <search v-on:stockSearch="findStock($event)"></search>
      <br />
      <div>
        <price
          v-for="(stk, name) in stockPrices"
          :key="name"
          v-bind:incData="message[name]"
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
import search from "../components/Chart/Search.vue";
import price from "../components/Price.vue";

const pricesStoreName = "prices";
const barsStoreName = "socketModule";
export default {
  name: "live",
  components: { search, price },
  data() {
    return {
      stockCode: null
    };
  },
  methods: {
    findStock: async function(stockCode) {
      if (!stockCode) {
        this.$notify({
          group: "app",
          text: "Missing input",
          type: "warn"
        });
      } else {
        stockService.getStockInformation(stockCode);
      }
    },
    deleteChart(data) {
      stockService.cancelSubscription(data);
    }
  },
  computed: {
    ...mapState(pricesStoreName, ["stockPrices"]),
    ...mapState(barsStoreName, ["message"])
  }
};
</script>
