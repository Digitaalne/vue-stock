<template>
  <div class="half centered">
    <div class="md-layout md-gutter">
      <div class="md-layout-item">
        <md-field>
          <md-input
            name="search"
            type="text"
            placeholder="Enter stock symbol"
            v-model="symbol"
            v-debounce:300ms="searchStockSymbol"
          />
          <md-button id="search-button" class="md-primary" @click="startSearch"
            >Search</md-button
          >
        </md-field>
      </div>

      <md-speed-dial md-direction="bottom" id="fav-but">
        <md-speed-dial-target>
          <md-icon>favorite</md-icon>
        </md-speed-dial-target>
        <md-speed-dial-content class="fav-selection">
          <md-button
            v-for="(fav, index) in favs"
            :key="index"
            @click="finishAutocomplete({ symbol: fav })"
            class="md-icon-button"
            >{{ fav }}</md-button
          >
        </md-speed-dial-content>
      </md-speed-dial>
    </div>
    <div v-on:blur="possibleSymbols = []">
      <span
        v-for="(searchAnswer, index) in possibleSymbols"
        :key="index"
        @click="finishAutocomplete(searchAnswer)"
      >
        <span>
          <span id="info"
            >{{ searchAnswer.symbol }} - {{ searchAnswer.description }}</span
          >
          <md-button
            class="md-icon-button pd"
            @click="toggleFav(searchAnswer.symbol)"
          >
            <span v-if="isFav(searchAnswer.symbol)">
              <md-icon> favorite</md-icon>
            </span>
            <span v-else>
              <md-icon>favorite_border</md-icon>
            </span>
          </md-button>
        </span>
        <br />
      </span>
    </div>
  </div>
</template>

<script>
import favouriteService from "../../service/favouriteService.js";
import stockService from "../../service/stockService.js";
import debounce from "debounce";
export default {
  name: "Search",
  data() {
    return {
      symbol: "",
      selectedStock: Object,
      possibleSymbols: [],
      favs: null
    };
  },
  methods: {
    async searchStockSymbol() {
      this.possibleSymbols = await stockService.searchStockSymbol(this.symbol);
    },

    finishAutocomplete(stock) {
      this.symbol = stock.symbol;
      this.selectedStock = stock;
      this.possibleSymbols = [];
    },

    startSearch() {
      if (this.selectedStock.symbol === undefined) {
        this.selectedStock.symbol = this.symbol;
      }
      this.$emit("stockSearch", this.selectedStock);
      this.symbol = "";
      this.selectedStock = {};
      this.possibleSymbols = [];
    },

    isFav(symbol) {
      return favouriteService.isFav(symbol);
    },

    toggleFav(symbol) {
      return favouriteService.toggleFav(symbol);
    }
  },
  created() {
    this.searchStockSymbol = debounce(this.searchStockSymbol, 300);
  },
  mounted() {
    this.favs = favouriteService.getFavs();
  }
};
</script>

<style lang="scss" scoped>
#fav-but {
  overflow: visible;
  margin-top: 15px;
}
.pd {
  padding-bottom: 20px;
}

.fav-selection {
  position: absolute;
  align-self: center;
  margin-top: 60px;
}
</style>
