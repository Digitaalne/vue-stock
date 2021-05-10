<template>
  <div id="nav">
    <md-tabs md-sync-route>
      <md-tab id="tab-live" md-icon="timeline" md-label="LIVE" to="/live" exact
        ><span id="tab-live"
      /></md-tab>
      <md-tab
        id="tab-historic"
        md-icon="history"
        md-label="HISTORIC DATA"
        to="/historic"
      ></md-tab>
      <md-tab
        id="tab-position"
        md-icon="account_balance"
        md-label="POSITION"
        to="/position"
      ></md-tab>
      <md-tab
        id="tab-history"
        md-icon="list"
        md-label="TRADE HISTORY"
        to="/history"
      ></md-tab>
      <md-tab
        id="tab-service"
        md-icon="military_tech"
        md-label="BROKER"
        to="/service"
      ></md-tab>
    </md-tabs>
  </div>
</template>

<script>
export default {
  name: "Navigation"
};
</script>
