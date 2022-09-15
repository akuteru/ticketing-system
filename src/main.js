import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import firebase from './firebase/index'
import VueHtmlToPaper from 'vue-html-to-paper'

Vue.config.productionTip = false


const options = {
  name: '_blank',
  specs: [
    'fullscreen=yes',
    'titlebar=yes',
    'scrollbars=yes'
  ],
  styles: [
    'https://cdn.jsdelivr.net/npm/@mdi/font@6.x/css/materialdesignicons.min.css',
    'https://cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.min.css'
  ],
  timeout: 1000, // default timeout before the print window appears
  autoClose: true, // if false, the window will not close after printing
  windowTitle: window.document.title, // override the window title
 
}
Vue.use(VueHtmlToPaper, options)
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
