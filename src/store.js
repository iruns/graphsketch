import Vue from 'vue'
import Vuex from 'vuex'
import firebase from './firebase'

import _ from 'lodash'

import account from './modules/account'
import project from './modules/project'
import spread from './modules/spread'
import item from './modules/item'

Vue.use(Vuex);
Vue.use(firebase);

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  modules: {
    account,
    project,
    spread,
    item,
  },
  state: {

  },
  getters: {

  },
  mutations: {

  },
  actions: {
    // toggleDropdown (context, payload) {
    //   console.log(payload);
    // }
  }
})
