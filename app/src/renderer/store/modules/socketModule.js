import Vue from 'vue'

const getDefaultState = () => {
  return {
    isConnected: false,
    message: {},
    reconnectError: false
  }
}

const state = getDefaultState()

const mutations = {
  SOCKET_ONOPEN (state, event) {
    Vue.prototype.$socket = event.currentTarget
    state.isConnected = true
  },
  SOCKET_ONCLOSE (state, event) {
    state.isConnected = false
  },
  SOCKET_ONERROR (state, event) {
    console.error(state, event)
  },
  // default handler called for all methods
  SOCKET_ONMESSAGE (state, message) {
    var toObj = JSON.parse(message.data)
    var keys = Object.keys(toObj)
    for (var i = 0; i < keys.length; i++) {
      // console.log( message.data[ keys[ i ] ] )
      if (keys[i] in state.message) {
        // state.message[keys[i]].stock_data_list = [...state.message[keys[i]].stock_data_list, ...toObj[keys[i]].stock_data_list]
        // state.message[keys[i]].stock_volume_list = [...state.message[keys[i]].stock_volume_list, ...toObj[keys[i]].stock_volume_list]
        Vue.set(state.message, keys[i], {
          stock_data_list: [
            ...state.message[keys[i]].stock_data_list,
            ...toObj[keys[i]].stock_data_list
          ],
          stock_volume_list: [
            ...state.message[keys[i]].stock_volume_list,
            ...toObj[keys[i]].stock_volume_list
          ]
        })
      } else {
        // state.message[keys[i]] = toObj[keys[i]]
        Vue.set(state.message, keys[i], toObj[keys[i]])
      }
    }
  },
  // mutations for reconnect methods
  SOCKET_RECONNECT (state, count) {
    console.info(state, count)
  },
  SOCKET_RECONNECT_ERROR (state) {
    state.reconnectError = true
  },
  // reset state
  RESET_STATE (state) {
    Object.assign(state, getDefaultState())
  }
}

const actions = {
  socketOnopen ({ commit }, event) {
    commit('SOCKET_ONOPEN', event)
  },
  socketOnclose ({ commit }, event) {
    commit('SOCKET_ONCLOSE', event)
  },
  socketOnerror ({ commit }, event) {
    commit('SOCKET_ONERROR', event)
  },
  socketOnmessage ({ commit }, event) {
    commit('SOCKET_ONMESSAGE', event)
  },
  socketReconnect ({ commit }, event) {
    commit('SOCKET_RECONNECT', event)
  },
  socketReconnectError ({ commit }) {
    commit('SOCKET_RECONNECT_ERROR')
  },
  resetState ({ commit }) {
    commit('RESET_STATE')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
