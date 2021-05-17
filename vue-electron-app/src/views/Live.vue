<template>
  <div id="live" class="container">
    <div>
      <div id="status" v-if="marketData !== undefined">
        <span v-if="marketData.is_open">
          <md-chip class="md-primary">Market: OPEN</md-chip>
        </span>
        <span v-else>
          <md-chip class="md-accent">Market: CLOSED</md-chip>
        </span>
      </div>
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
import stockService from "../service/stockService.js";
import { mapState } from "vuex";
import Search from "../components/Chart/Search.vue";
import Price from "../components/Price.vue";

const pricesStoreName = "prices";
const barsStoreName = "socketModule";
export default {
  name: "live",
  components: { Search, Price },
  data() {
    return {
      stockCode: null,
      marketData: undefined,
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
        stockService.getStockInformation(stockCode);
      }
    },
    deleteChart(data) {
      stockService.cancelSubscription(data);
    },
  },
  computed: {
    ...mapState(pricesStoreName, ["stockPrices"]),
    ...mapState(barsStoreName, ["message"]),
  },
  async created() {
    this.marketData = await stockService.getMarketStatus();
  },
};
</script>

<style lang="scss" scoped>
#status {
  margin-left: 5%;
}
</style>
