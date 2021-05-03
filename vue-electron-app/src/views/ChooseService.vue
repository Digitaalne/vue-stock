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
            <md-button v-on:click="setService('ALPACA')"
              >Choose Alpaca</md-button
            >
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
            <md-button
              v-on:click="
                setService('IBKR');
                getAccounts();
              "
              >Choose IBKR</md-button
            >
          </md-card-actions>
        </md-card>
      </div>
    </div>
    <div v-if="service !== undefined">
      <md-radio
        v-if="service === 'IBKR'"
        id="dataService"
        name="dataServices"
        v-model="dataService"
        :value="'IBKR'"
        @change="setDataService"
        >IBKR</md-radio
      >
      <md-radio
        v-if="service === 'ALPACA'"
        id="dataService"
        name="dataServices"
        v-model="dataService"
        :value="'ALPACA'"
        @change="setDataService"
        >ALPACA</md-radio
      >
      <md-radio
        id="dataService"
        name="dataServices"
        v-model="dataService"
        :value="'FMP'"
        @change="setDataService"
        >FMP</md-radio
      >
    </div>
    <div id="ibkr" v-if="service === 'IBKR'">
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
        Choose your account <br />
        <md-radio
          id="accounts"
          name="accounts"
          v-model="account"
          v-for="acc in accounts"
          :key="acc"
          :value="acc"
          @change="setAccount"
          >{{ acc }}</md-radio
        >
      </div>
    </div>
    <div id="alpaca" v-if="service === 'ALPACA'">
      <md-field>
        <label for="alpaca-key">Alpaca Key Id:</label>
        <md-input
          id="alpaca-key"
          v-model="keyId"
          v-debounce:300ms="setKeyId"
        ></md-input>
      </md-field>
      <md-field>
        <label for="alpaca-secret">Alpaca Secret Key:</label>
        <md-input
          id="alpaca-secret"
          v-model="secretKey"
          v-debounce:300ms="setSecretKey"
        ></md-input>
      </md-field>
      <md-switch id="alpaca-paper" v-model="paper" @change="setPaper"
        >Use paper account</md-switch
      >
    </div>
    <div v-if="dataService === 'FMP'">
      <md-field>
        <label for="ibkr-port">FMP api key:</label>
        <md-input
          id="fmp-apikey"
          v-model="apiKey"
          v-debounce:300ms="setApiKey"
        ></md-input>
      </md-field>
    </div>
  </div>
</template>

<script>
import ibService from "../service/IbService";
import confService from "../service/ConfService";

export default {
  name: "chooseService",
  data() {
    return {
      port: Number,
      service: String,
      accounts: [],
      account: String,
      keyId: String,
      secretKey: String,
      paper: Boolean,
      dataService: String,
      apiKey: String,
    };
  },
  created() {
    this.port = confService.getServiceConfiguration("port");
    this.service = confService.getActiveService();
    this.account = confService.getServiceConfiguration("account");
    this.keyId = confService.getServiceConfiguration("keyId");
    this.secretKey = confService.getServiceConfiguration("secretKey");
    this.paper = confService.getServiceConfiguration("paper");
    this.dataService = confService.getActiveDataService();
    this.apiKey = confService.getDataServiceConfiguration("apiKey");
  },
  methods: {
    setPort() {
      confService.setServiceConfiguration("port", this.port);
    },
    setService(service) {
      confService.setConfiguration("service", service);
      this.service = service;
      if (
        this.dataService !== undefined &&
        (this.dataService !== this.service || this.dataService !== "FMP")
      ) {
        this.setDataService(this.service);
      }
    },
    async getAccounts() {
      if (this.service === "IBKR") {
        this.accounts = await ibService.getAllAccounts();
      }
    },
    setAccount() {
      confService.setServiceConfiguration("account", this.account);
    },
    setKeyId() {
      confService.setServiceConfiguration("keyId", this.keyId);
    },
    setSecretKey() {
      confService.setServiceConfiguration("secretKey", this.secretKey);
    },
    setPaper() {
      confService.setServiceConfiguration("paper", this.paper);
    },
    setDataService() {
      confService.setConfiguration("dataService", this.dataService);
    },
    setApiKey() {
      confService.setDataServiceConfiguration("apiKey", this.apiKey);
    },
  },
  mounted() {
    this.getAccounts();
  },
};
</script>