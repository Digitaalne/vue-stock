<template>
  <div id="position">
    <md-table md-card>
      <md-table-toolbar>
        <h1 class="md-title">User Positions</h1>
      </md-table-toolbar>
      <md-table-row>
        <md-table-head>Symbol</md-table-head>
        <md-table-head>Exchange</md-table-head>
        <md-table-head>Asset Class</md-table-head>
        <md-table-head>Average Entry Price ($)</md-table-head>
        <md-table-head>Quanitity</md-table-head>
        <md-table-head>Market Value ($)</md-table-head>
        <md-table-head>Cost Basis ($)</md-table-head>
        <md-table-head>Unrealized profit/loss ($)</md-table-head>
        <md-table-head>Unrealized profit/loss (%)</md-table-head>
        <md-table-head>Unrealized profit/loss for the day ($)</md-table-head>
        <md-table-head>Unrealized profit/loss for the day (%)</md-table-head>
        <md-table-head>Current Price ($)</md-table-head>
        <md-table-head>Last Day Price ($)</md-table-head>
        <md-table-head>Change Today (%)</md-table-head>
      </md-table-row>
      <md-table-row v-for="position in positionList" :key="position.asset_id">
        <md-table-cell>{{ position.symbol }}</md-table-cell>
        <md-table-cell>{{ position.exchange }}</md-table-cell>
        <md-table-cell>{{ position.asset_class }}</md-table-cell>
        <md-table-cell
          >{{ position.avg_entry_price /*.toFixed(3)*/ }}
        </md-table-cell>
        <md-table-cell>{{ position.qty }}</md-table-cell>
        <md-table-cell>{{ position.market_value }}</md-table-cell>
        <md-table-cell>{{ position.cost_basis }}</md-table-cell>
        <md-table-cell>{{ position.unrealized_pl }}</md-table-cell>
        <md-table-cell>{{
          position.unrealized_plpc * 100 /*.toFixed(2)*/
        }}</md-table-cell>
        <md-table-cell>{{ position.unrealized_intraday_pl }}</md-table-cell>
        <md-table-cell>{{
          position.unrealized_intraday_plpc * 100 /*.toFixed(2)*/
        }}</md-table-cell>
        <md-table-cell>{{ position.current_price }}</md-table-cell>
        <md-table-cell>{{ position.lastday_price }}</md-table-cell>
        <md-table-cell>{{
          position.change_today * 100 /*.toFixed(2)*/
        }}</md-table-cell>
      </md-table-row>
    </md-table>
  </div>
</template>

<script>
import paperService from "../service/PaperService.js";

export default {
  data() {
    return {
      positionList: null
    };
  },
  methods: {
    async loadData() {
      this.positionList = await paperService.getPositionList();
      console.log(this.positionList);
    }
  },
  created() {
    this.loadData();
  }
};
</script>

<style lang="scss" scoped></style>
