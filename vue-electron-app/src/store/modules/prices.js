import Vue from "vue";

const state = {
    stockprices: {}
}
  
const mutations = {
    UPDATE (state, event) {
        if(!(event.name in state.stockprices)){
            Vue.set(state.stockprices, event.name, event)
            return;
        }
        if(event.askPrice != undefined){
            Vue.set(state.stockprices, event.name, {
                ...state.stockprices[event.name],
                askPrice: event.askPrice
            })
        }
        if(event.bidPrice != undefined){
            Vue.set(state.stockprices, event.name, {
                ...state.stockprices[event.name],
                bidPrice: event.bidPrice
            })
        }
        if(event.lastPrice != undefined){
            Vue.set(state.stockprices, event.name, {
                ...state.stockprices[event.name],
                lastPrice: event.lastPrice
            })
        }
        if(event.volume != undefined){
            Vue.set(state.stockprices, event.name, {
                ...state.stockprices[event.name],
                volume: event.volume
            })
        }
    }
}

const actions = {
    update ({ commit }, event ) {
        commit('UPDATE', event)
    },
}


export default {
    namespaced: true,
    state,
    mutations,
    actions
}
  