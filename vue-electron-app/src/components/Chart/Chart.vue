<template>
  <div id="chart">
    <span
      v-if="
        this.incData !== undefined && this.stockOptions.series[0].data !== null
      "
    >
      <highcharts
        class="stock"
        :constructor-type="'stockChart'"
        :options="stockOptions"
      ></highcharts>
    </span>
    <span v-else>
      <md-progress-spinner md-mode="indeterminate"></md-progress-spinner>
    </span>
  </div>
</template>

<script>
import Highcharts from "highcharts";
import stockInit from "highcharts/modules/stock";
stockInit(Highcharts);
export default {
  props: ["name", "rangeSelect", "incData"],

  data() {
    return {
      stockOptions: {
        title: {
          text: this.name + " Stock Price"
        },
        rangeSelector: this.rangeSelect,
        yAxis: [
          {
            labels: {
              align: "right",
              x: -3
            },
            title: {
              text: "OHLC"
            },
            height: "60%",
            lineWidth: 2,
            resize: {
              enabled: true
            }
          },
          {
            labels: {
              align: "right",
              x: -3
            },
            title: {
              text: "Volume"
            },
            top: "65%",
            height: "35%",
            offset: 0,
            lineWidth: 2
          }
        ],
        tooltip: {
          split: true
        },
        series: [
          {
            type: "candlestick",
            name: this.name,
            data: this.incData?.stock_data_list,
            turboThreshold: 10000
          },
          {
            type: "column",
            name: "Volume",
            data: this.incData?.stock_volume_list,
            yAxis: 1
          }
        ]
      }
    };
  },
  watch: {
    incData: {
      deep: true,
      handler(newState) {
        this.stockOptions.series[0].data = newState.stock_data_list;
        this.stockOptions.series[1].data = newState.stock_volume_list;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
#modal {
  padding: 20px;
}
#chart {
  margin-left: 5%;
  margin-right: 5%;
  margin-top: 2%;
}
</style>
