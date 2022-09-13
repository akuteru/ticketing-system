import Vue from 'vue'
import Vuex from 'vuex'
import snack from './snack'

Vue.use(Vuex)

export default new Vuex.Store({
  namespaced: true,
  state: {
    user:{
      loggedIn: false,
      data: null,
      userToken: ''
    }
  },
  getters: {
    userInfo(state){
      return state.user
    }
  },
  mutations: {
    SET_LOGGEDIN(state, value){
      state.user.loggedIn = value
    },
    SET_USER(state, data){
      state.user.data = data
    },
    SET_TOKEN(state, token){
      state.user.userToken = token
    }
  },
  actions: {
    fetchUser({commit}, user){
      commit('SET_LOGGEDIN', user !== null);
      if(user){
        commit('SET_USER', {
          email: user.email
        })
      } else {
        commit('SET_USER', null)
      }
    },
    initializeToken({commit}, token){
      commit('SET_TOKEN', token)
    }
  },
  modules: {
    snack
  }
})
