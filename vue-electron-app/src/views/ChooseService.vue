<template>
  <div>
    <div class="md-layout md-gutter">
      <div class="md-layout-item">
        <md-card class="md-primary">
          <md-card-header>
            <md-card-header-text>
              <div class="md-title">Alpaca</div>
              <div class="md-subhead">
                Choose Alpaca as broker for current application
              </div>
            </md-card-header-text>

            <md-card-media>
              <md-icon>pets</md-icon>
            </md-card-media>
          </md-card-header>

          <md-card-actions>
            <md-button  v-on:click="setService('ALPACA')" >Choose Alpaca</md-button>
          </md-card-actions>
        </md-card>
      </div>
      <div class="md-layout-item">
        <md-card class="md-accent">
          <md-card-header>
            <md-card-header-text>
              <div class="md-title">Interactive Brokers</div>
              <div class="md-subhead">
                Choose IBKR as broker for current application
              </div>
            </md-card-header-text>

            <md-card-media>
              <md-icon>assignment_ind</md-icon>
            </md-card-media>
          </md-card-header>

          <md-card-actions>
            <md-button v-on:click="setService('IBKR'); getAccounts()">Choose IBKR</md-button>
          </md-card-actions>
        </md-card>
      </div>
    </div>
    <div id="ibkr" v-if="service==='IBKR'">
      <md-field>
        <label for="ibkr-port">IBKR API Port:</label>
        <md-input
          type="number"
          id="ibkr-port"
          v-model="port"
          v-debounce:300ms="setPort"
        ></md-input>
      </md-field>
      <div class="md-layout-item">
        Choose your account <br>
        <md-radio id="accounts" name="accounts" v-model="account" v-for="acc in accounts" :key="acc" :value="acc" @change="setAccount">{{acc}}</md-radio>
      </div>
    </div>
  </div>
</template>

<script>
import ibService from '../service/IbService'
export default {
  name: "chooseService",
  data() {
    return {
        port: Number,
        service: String,
        accounts: [],
        account: String
    };
  },
  created(){
      this.port = localStorage.getItem("PORT")
      this.service = localStorage.getItem("SERVICE")
      this.account = localStorage.getItem("ACCOUNT")
  },
  methods:{
    setPort(){
      localStorage.setItem("PORT", this.port);
    },
    setService(service){
        localStorage.setItem("SERVICE", service)
        this.service = service
    },
    async getAccounts(){
      if(this.service === "IBKR"){
        this.accounts = await ibService.getAllAccounts()
      }
    },
    setAccount(){
      console.log("this")
      localStorage.setItem("ACCOUNT", this.account)
    }
  },
  mounted() {
    this.getAccounts()
  }
};
</script>