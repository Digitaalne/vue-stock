<template>
  <div id="history">
    <md-table>
      <md-table-toolbar>
        <h1 class="md-title">History:</h1>
      </md-table-toolbar>
      <md-table-row>
        <md-table-head>Symbol</md-table-head>
        <md-table-head>Activity Type</md-table-head>
        <md-table-head>Cumulative Quanitity</md-table-head>
        <md-table-head>To be filled</md-table-head>
        <md-table-head>Price</md-table-head>
        <md-table-head>Quanitity</md-table-head>
        <md-table-head>Side</md-table-head>
        <md-table-head>Transaction Time</md-table-head>
        <md-table-head>Type</md-table-head>
      </md-table-row>
      <md-table-row v-for="activity in list" :key="activity.id">
        <md-table-cell>{{ activity.symbol }}</md-table-cell>
        <md-table-cell>{{ activity.activity_type }}</md-table-cell>
        <md-table-cell>{{ activity.cum_qty }}</md-table-cell>
        <md-table-cell>{{ activity.leaves_qty }}</md-table-cell>
        <md-table-cell>{{ activity.price }}</md-table-cell>
        <md-table-cell>{{ activity.qty }}</md-table-cell>
        <md-table-cell>{{ activity.side }}</md-table-cell>
        <md-table-cell> {{ activity.transaction_time }}</md-table-cell>
        <md-table-cell>{{ activity.type }}</md-table-cell>
      </md-table-row>
    </md-table>
  </div>
</template>

<script>
import paperService from "../service/paperService.js";
export default {
  name: "TradeHistory",
  data() {
    return {
      list: null,
    };
  },
  methods: {
    async loadData() {
      this.list = await paperService.getActivitesList();
    },
  },
  created() {
    this.loadData();
  },
};
</script>
