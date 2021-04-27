import Vue from "vue";

const state = {
    stockPrices: {}
}
  
const mutations = {
    UPDATE (state, event) {
        if(!(event.name in state.stockPrices)){
            Vue.set(state.stockPrices, event.name, event)
            return;
        }
        if(event.askPrice != undefined){
            Vue.set(state.stockPrices, event.name, {
                ...state.stockPrices[event.name],
                askPrice: event.askPrice
            })
        }
        if(event.bidPrice != undefined){
            Vue.set(state.stockPrices, event.name, {
                ...state.stockPrices[event.name],
                bidPrice: event.bidPrice
            })
        }
        if(event.lastPrice != undefined){
            Vue.set(state.stockPrices, event.name, {
                ...state.stockPrices[event.name],
                lastPrice: event.lastPrice
            })
        }
        if(event.volume != undefined){
            Vue.set(state.stockPrices, event.name, {
                ...state.stockPrices[event.name],
                volume: event.volume
            })
        }
    },
    DELETE (state, key) {
        Vue.delete(state.stockPrices, key)
      }
}

const actions = {
    update ({ commit }, event ) {
        commit('UPDATE', event)
    },
    delete ({ commit }, event) {
        commit('DELETE', event)
      }
}


export default {
    namespaced: true,
    state,
    mutations,
    actions
}
  