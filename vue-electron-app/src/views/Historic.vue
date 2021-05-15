<template>
  <div id="historic" class="container">
    <div id="warning" v-if="showWarning === true">
      <md-icon>info</md-icon> This functionality is not supported for selected
      data service
    </div>
    <div id="selection">
      <div class="half centered">
        <div class="md-layout-item">
          <span class="md-caption" for="dates">Date Range</span>
          <br />
          <v-date-picker
            name="dates"
            v-model="dates"
            is-range
            :max-date="new Date().setDate(new Date().getDate() - 1)"
          />
        </div>
        <div class="md-layout-item">
          <span class="md-caption">Timeframe</span>
          <md-field>
            <md-select id="timeframe" name="timeframe" v-model="timeframe">
              <md-option value="1Min">Minute</md-option>
              <md-option value="5Min">5 Minutes</md-option>
              <md-option value="15Min">15 Minutes</md-option>
              <md-option value="1D">Day</md-option>
            </md-select>
          </md-field>
        </div>
      </div>
      <search v-on:stockSearch="searchStockInfo($event)"></search>
    </div>
    <chart
      v-on:closeChart="deleteChart($event)"
      v-for="stk in stockList"
      :key="stk.t"
      v-bind:incData="stk"
      v-bind:name="stk.name"
      v-bind:rangeSelect="rangeSelect"
    ></chart>
  </div>
</template>

<script>
import Vue from "vue";
import stockService from "../service/stockService.js";
import Chart from "../components/Chart/Chart.vue";
import VCalendar from "v-calendar";
import Search from "../components/Chart/Search.vue";
import confService from "../service/confService.js";

Vue.use(VCalendar);

export default {
  name: "Historic",
  // eslint-disable-next-line vue/no-unused-components
  components: { Chart, VCalendar, Search },
  data() {
    return {
      showWarning: Boolean,
      dates: null,
      symbol: null,
      timeframe: null,
      stockList: [],
      rangeSelect: {
        buttons: [
          {
            type: "all",
            text: "ALL",
          },
        ],
        selected: 0,
        inputEnabled: false,
      },
    };
  },
  methods: {
    searchStockInfo: async function (symbol) {
      if (this.checkInput(symbol)) {
        const helper = await stockService.getHistoricStockInformation(
          this.dates.start,
          this.dates.end,
          symbol,
          this.timeframe
        );
        if (helper && helper.stock_data_list.length > 0) {
          this.stockList.push(helper);
          console.log(this.stockList);
        } else {
          Vue.notify({
            group: "app",
            text: "Information not found!",
            type: "warn",
          });
        }
      }
    },
    checkInput(symbol) {
      if (!this.timeframe || !this.dates || !symbol) {
        Vue.notify({
          group: "app",
          text: "Missing input",
          type: "warn",
        });
        return false;
      }
      return true;
    },
    deleteChart(stockCode) {
      this.stockList = this.stockList.filter(function (stock) {
        return stock.name !== stockCode;
      });
    },
  },
  created() {
    this.showWarning = confService.getActiveDataService() === "IBKR";
  },
};
</script>

<style lang="scss" scoped>
#warning {
  margin: 1% 5% 1% 5%;
  padding: 15px 15px 15px 15px;
  box-shadow: 5px 5px 5px -6px #000000;
  background: #ff9800;
  text-shadow: 0px 0px 0px #000000;
}
</style>
