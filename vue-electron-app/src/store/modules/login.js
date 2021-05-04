const state = {
  loggedIn: Boolean(isLoggedIn)
};

const mutations = {
  LOGIN(state) {
    state.loggedIn = Boolean(isLoggedIn);
  },
  LOGOUT(state) {
    state.loggedIn = false;
    localStorage.removeItem("AUTH_TOKEN");
    localStorage.removeItem("SERVICE");
  }
};

const actions = {
  login({ commit }) {
    commit("LOGIN");
  },
  logout({ commit }) {
    commit("LOGOUT");
  }
};

function isLoggedIn() {
  if (localStorage.getItem("AUTH_TOKEN")) {
    return true;
  }
  return false;
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
