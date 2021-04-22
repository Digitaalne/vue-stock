<template>
  <div>
    ask price: {{ stockPrices[name].askPrice }}
    <br />
    bid price: {{ stockPrices[name].bidPrice }}
    <br />
    last price: {{ stockPrices[name].lastPrice }}
  </div>
</template>
  
<script>
import { mapState } from "vuex";
const storeName = "prices";
export default {
  props: ["name"],
  computed: {
    ...mapState(storeName, ["stockPrices"]),
  },
};
</script>