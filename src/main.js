import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import firebase from './firebase/index'


Vue.config.productionTip = false

let app = '';

firebase.auth.onAuthStateChanged( user => {
  store.dispatch("fetchUser", user)
  if(user != null){
    user.getIdToken()
      .then((token) => { 
        store.dispatch("initializeToken", token)
      })
      .catch((err) => console.log(err))
  }
  else{
    store.dispatch("initializeToken", "")
  }
  if(!app){
    app = new Vue({
      router,
      store,
      vuetify,
      render: h => h(App)
    }).$mount('#app')
  }
})
