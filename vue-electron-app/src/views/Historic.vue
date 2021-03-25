<template>
  <div id="historic" class = "container">
    <div id="selection">
      <div class="half centered">
        <div class="md-layout-item">
          <span class="md-caption">Date Range</span>
          <v-date-picker name="dates" v-model="dates" mode="range" />
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
import Vue from 'vue'
import StockService from '../service/StockService.js'
import chart from '../components/Chart/Chart.vue'
import VCalendar from 'v-calendar'
import search from '../components/Chart/Search.vue'
import ibService from '../service/IbService.ts'

Vue.use(VCalendar)

export default {
  name: 'historic',
  components: { chart, VCalendar, search },
  data () {
    return {
      dates: null,
      symbol: null,
      timeframe: null,
      stockList: {},
      rangeSelect: {
        buttons: [
          {
            type: 'all',
            text: 'ALL'
          }
        ],
        selected: 0,
        inputEnabled: false
      }
    }
  },
  methods: {
    searchStockInfo: async function (symbol) {
      if (this.checkInput(symbol)) {
        var helper = await StockService.getStockInformation(
          this.dates.start,
          this.dates.end,
          symbol,
          this.timeframe
        )
        helper[symbol].name = symbol
        if (helper && helper[symbol].stock_data_list.length > 0) {
          this.stockList = [...this.stockList, helper[symbol]]
        } else {
          Vue.notify({
            group: 'app',
            text: 'Information not found!',
            type: 'warn'
          })
        }
      }
    },
    checkInput (symbol) {
      if (!this.timeframe || !this.dates || !symbol) {
        Vue.notify({
          group: 'app',
          text: 'Missing input',
          type: 'warn'
        })
        return false
      }
      return true
    },
    deleteChart (stockCode) {
      this.stockList = this.stockList.filter(function (stock) { return stock.name !== stockCode })
    },
    testMethod() {
      console.log('yee', ibService.searchStockSymbol("GME"));
      ibService.getHistoricalData(null, "20210319 23:59:59 GMT", "3 D", "1 hour")
    }
  },
  mounted() {
    this.testMethod();
  }
}
</script>