<template>
  <div id="chart">
    <span v-if="this.stockOptions.series[0].data !== null">
      <highcharts
        class="stock"
        :constructor-type="'stockChart'"
        :options="stockOptions"
      ></highcharts>
    </span>
    <span v-else> NULL </span>
  </div>
</template>

<script>
import modal from "../Modal.vue";
import Highcharts from "highcharts";
import { mapState } from "vuex";
import stockInit from "highcharts/modules/stock";

const storeName = "socketModule";
stockInit(Highcharts);
export default {
  props: ["name", "rangeSelect"],
  components: {
    modal,
  },
  computed: {
    ...mapState(storeName, ["message"]),
  },
  data() {
    return {
      stockOptions: {
        title: {
          text: this.name + " Stock Price",
        },
        rangeSelector: this.rangeSelect,
        yAxis: [
          {
            labels: {
              align: "right",
              x: -3,
            },
            title: {
              text: "OHLC",
            },
            height: "60%",
            lineWidth: 2,
            resize: {
              enabled: true,
            },
          },
          {
            labels: {
              align: "right",
              x: -3,
            },
            title: {
              text: "Volume",
            },
            top: "65%",
            height: "35%",
            offset: 0,
            lineWidth: 2,
          },
        ],
        tooltip: {
          split: true,
        },
        series: [
          {
            type: "candlestick",
            name: this.name,
            data: null,
            turboThreshold: 10000,
          },
          {
            type: "column",
            name: "Volume",
            data: null,
            yAxis: 1,
          },
        ],
      },
    };
  },
  watch: {
    message: {
      deep: true,
      handler(newState) {
        this.stockOptions.series[0].data = newState[this.name].stock_data_list;
        this.stockOptions.series[1].data =
          newState[this.name].stock_volume_list;
      },
    },
  },
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