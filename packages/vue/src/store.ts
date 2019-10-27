import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const baseUrl = 'http://localhost:8000';

export default new Vuex.Store({
  state: {

  },
  getters: {
    getBaseUrl() {
      return baseUrl;
    },
  },
  mutations: {

  },
  actions: {
  },
});
