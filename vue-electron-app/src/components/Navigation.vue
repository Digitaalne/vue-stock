<template>
  <div id="nav">
    <md-tabs md-sync-route >
      <span v-if="this.loggedIn">
      <md-tab id="tab-live"  md-icon="timeline" md-label="LIVE" to="/live" exact><span id="tab-live"/></md-tab>
      <md-tab id="tab-historic" md-icon="history" md-label="HISTORIC DATA" to="/historic"></md-tab>
      <md-tab id="tab-position" md-icon="account_balance" md-label="POSITION" to="/position"></md-tab>
      <md-tab id="tab-history"  md-icon="list" md-label="TRADE HISTORY" to="/history"></md-tab>
      <md-tab id="tab-service" md-icon="military_tech"  md-label="BROKER" to="/service"></md-tab>
      <md-tab id="tab-login" md-icon="account_circle" md-label="LOG OUT" @click="logout()"></md-tab>
      </span>
      <md-tab id="tab-login" md-icon="account_box"  md-label="LOG IN" v-else @click="login()"></md-tab>

    </md-tabs>
  </div>
</template>

<script>
import store from '../store/index'
import { mapState } from 'vuex'
import authService from '../service/Auth.js'
export default {
  name: 'Navigation',
  methods: {
    login () {
      authService.init()
    },
    logout () {
      store.dispatch('login' + '/logout')
      this.$router.push('/')
    }
  },
  computed: {
    ...mapState('login', ['loggedIn'])
  }
}
</script>
