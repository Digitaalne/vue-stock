import Vue from "vue";

const getDefaultState = () => {
  return {
    isConnected: false,
    message: {},
    reconnectError: false
  };
};

const state = getDefaultState();

const mutations = {
  SOCKET_ONOPEN(state, event) {
    Vue.prototype.$socket = event.currentTarget;
    state.isConnected = true;
  },
  SOCKET_ONCLOSE(state, event) {
    state.isConnected = false;
  },
  SOCKET_ONERROR(state, event) {
    console.error(state, event);
  },
  /**
   * Add new data to existing data
   *
   * @param {*} state
   * @param {*} message new incoming message
   */
  SOCKET_ONMESSAGE(state, message) {
    const toObj = JSON.parse(message.data);
    const keys = Object.keys(toObj);
    for (let i = 0; i < keys.length; i++) {
      if (keys[i] in state.message) {
        Vue.set(state.message, keys[i], {
          ...state.message[keys[i]],
          stock_data_list: [
            ...state.message[keys[i]].stock_data_list,
            ...toObj[keys[i]].stock_data_list
          ],
          stock_volume_list: [
            ...state.message[keys[i]].stock_volume_list,
            ...toObj[keys[i]].stock_volume_list
          ]
        });
      } else {
        Vue.set(state.message, keys[i], toObj[keys[i]]);
      }
    }
  },
  SOCKET_RECONNECT(state, count) {
    console.info(state, count);
  },
  SOCKET_RECONNECT_ERROR(state) {
    state.reconnectError = true;
  },
  RESET_STATE(state) {
    Object.assign(state, getDefaultState());
  },
  UNSUBSCRIBE(state, key) {
    Vue.delete(state.message, key);
  }
};

const actions = {
  socketOnopen({ commit }, event) {
    commit("SOCKET_ONOPEN", event);
  },
  socketOnclose({ commit }, event) {
    commit("SOCKET_ONCLOSE", event);
  },
  socketOnerror({ commit }, event) {
    commit("SOCKET_ONERROR", event);
  },
  socketOnmessage({ commit }, event) {
    commit("SOCKET_ONMESSAGE", event);
  },
  socketReconnect({ commit }, event) {
    commit("SOCKET_RECONNECT", event);
  },
  socketReconnectError({ commit }) {
    commit("SOCKET_RECONNECT_ERROR");
  },
  resetState({ commit }) {
    commit("RESET_STATE");
  },
  unsubscribe({ commit }, event) {
    commit("UNSUBSCRIBE", event);
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
