<template>
  <div id="chart">
    <button v-on:click="changeModalVisibility">BUY OR SELL</button>
    <br />
    <md-button @click="toggleFav()">
            <span v-if="isFavourite"><md-icon>favorite</md-icon></span>
            <span v-else><md-icon>favorite_border</md-icon></span>
          </md-button>
    <br/>
    <highcharts class="stock" :constructor-type="'stockChart'" :options="stockOptions"></highcharts>
    <md-dialog :md-active.sync="modalVisible" @close="changeModalVisibility">
      <div id="modal">
        <div class="md-layout-item">
        <md-field>
        <label for="qty">Quantity</label>
        <md-input type="number" id="qty" v-model="quantity" name="qty" min="1" />
        </md-field>
        </div>

        <md-radio id="sell" value="sell" v-model="side">Sell</md-radio>
        <md-radio id="buy" value="buy" v-model="side">Buy</md-radio>

        <div class="md-layout-item">
        <md-field>
        <label>Type</label>
        <md-select id="type" v-model="type">
          <md-option value="market">Market</md-option>
          <md-option value="limit">Limit</md-option>
          <md-option value="stop">Stop</md-option>
          <md-option value="stop_limit">Stop limit</md-option>
        </md-select>
        </md-field>
        </div>

        <div class="md-layout-item">
        <md-field>
        <label>Time in Force</label>
        <md-select id="time_in_force" v-model="time_in_force">
          <md-option value="day">Day</md-option>
          <md-option value="gtc">Good until canceled</md-option>
          <md-option value="opg">OPG</md-option>
          <md-option value="cls">CLS</md-option>
          <md-option value="ioc">Immediate Or Cancel</md-option>
          <md-option value="fok">Fill or Kill</md-option>
        </md-select>
        </md-field>
        </div>

        <span v-if="type === 'stop_limit' || type === 'limit'">
          <md-field>
          <label for="limit_price">Limit Price</label>
          <md-input type="number" id="limit_price" v-model="limit_price" name="limit_price" />
          </md-field>
        </span>

        <span v-if="type === 'stop_limit' || type === 'stop'">
          <md-field>
          <label for="stop_price">Stop Price</label>
          <md-input type="number" id="stop_price" v-model="stop_price" name="stop_price" />
          </md-field>
        </span>

        <md-checkbox id="extended_hours" name="extended_hours" v-model="extended_hours">Extended hours</md-checkbox>
<br>
        <md-button @click="placeOrder()" class = "md-primary md-raised">Place Order</md-button>
        </div>
    </md-dialog>
  </div>
</template>

<script>
import modal from '../Modal.vue'
import Highcharts from 'highcharts'
import stockInit from 'highcharts/modules/stock'
import paperService from '../../service/PaperService.js'
import favouriteService from '../../service/FavouriteService.js'
stockInit(Highcharts)
export default {
  props: ['incData', 'name', 'rangeSelect'],
  components: {
    modal
  },
  data () {
    return {
      isFavourite: this.isFav(),
      quantity: null,
      limit_price: null,
      stop_price: null,
      time_in_force: null,
      type: '',
      side: null,
      extended_hours: false,

      modalVisible: false,

      stockOptions: {
        title: {
          text: this.name + ' Stock Price'
        },
        rangeSelector: this.rangeSelect,
        yAxis: [
          {
            labels: {
              align: 'right',
              x: -3
            },
            title: {
              text: 'OHLC'
            },
            height: '60%',
            lineWidth: 2,
            resize: {
              enabled: true
            }
          },
          {
            labels: {
              align: 'right',
              x: -3
            },
            title: {
              text: 'Volume'
            },
            top: '65%',
            height: '35%',
            offset: 0,
            lineWidth: 2
          }
        ],
        tooltip: {
          split: true
        },
        series: [
          {
            type: 'candlestick',
            name: this.name,
            data: this.incData.stock_data_list,
            turboThreshold: 10000
          },
          {
            type: 'column',
            name: 'Volume',
            data: this.incData.stock_volume_list,
            yAxis: 1
          }
        ]
      }
    }
  },
  methods: {
    placeOrder: async function () {
      if (this.validateInput()) {
        if (await paperService.placeOrder({
          name: this.name,
          qty: this.quantity,
          limit_price: this.limit_price,
          stop_price: this.stop_price,
          type: this.type,
          side: this.side,
          time_in_force: this.time_in_force,
          extended_hours: this.extended_hours
        })) {
          this.changeModalVisibility()
          this.$notify({
            group: 'app',
            text: 'Order successfully placed',
            type: 'success'
          })
        }
      }
    },
    changeModalVisibility () {
      this.modalVisible = !this.modalVisible
    },
    validateInput () {
      if (
        !this.name ||
        !this.quantity ||
        !this.side ||
        this.type === '' ||
        !this.time_in_force
      ) {
        this.$notify({
          group: 'app',
          text: 'Missing input',
          type: 'warn'
        })
        return false
      } else if (
        (this.type === 'limit' || this.type === 'stop_limit') &&
        !this.limit_price
      ) {
        this.$notify({
          group: 'app',
          text: 'Limit price is unassigned',
          type: 'warn'
        })
        return false
      } else if (
        (this.type === 'stop' || this.type === 'stop_limit') &&
        !this.stop_price
      ) {
        this.$notify({
          group: 'app',
          text: 'Stop price is unassigned',
          type: 'warn'
        })
        return false
      } else if (
        this.extended_hours === true &&
        this.type !== 'limit' &&
        this.time_in_force !== 'day'
      ) {
        this.$notify({
          group: 'app',
          text:
            'Extended hours only works with type limit and time in force is equal to day',
          type: 'warn'
        })
        return false
      }
      return true
    },
    async toggleFav () {
      await favouriteService.toggleFav(this.name)
      this.isFav()
    },
    isFav () {
      this.isFavourite = Boolean(favouriteService.isFav(this.name))
      return this.isFav
    }
  }
}
</script>

<style lang="scss" scoped>
#modal {
  padding:20px;
}
#chart {
  margin-left: 5%;
  margin-right: 5%;
  margin-top: 2%;
}
</style>