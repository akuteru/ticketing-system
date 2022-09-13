import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Dashboard.vue'
import Login from '../views/LoginView.vue'
import ForgotPassword from '../views/ForgotPassword.vue'
import VerifyEmail from '../views/VerifyEmail.vue'
import Profile from '../views/ProfileSetup.vue'
import Messages from '../views/Tickets.vue'
import OpenTicket from '../views/OpenTicket.vue'
import store from '../store'
import firebase from 'firebase'

function requireAuth(to, from, next){
  var authenticated = store.getters['userInfo']
  if (authenticated.loggedIn === false) {
      next({
        path: '/login',
      })
  } else {
    if(authenticated.data.emailVerified === false){
      next({
        path: '/verifyemail',
      })
    }
    else{
      next()
    }
  } 
}
function checkAuth(to, from, next){
  var authenticated = store.getters['userInfo']
  if(authenticated.loggedIn){
    next({name: 'Home'})
  }
  else{
    next()
  }
}

const routes = [
  {
    path:'*',
    redirect:'/'
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
    beforeEnter: requireAuth
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    beforeEnter: checkAuth
  },
  {
    path: '/verifyemail',
    name: 'VerifyEmail',
    component: VerifyEmail,
    beforeEnter: requireAuth
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    beforeEnter: requireAuth
  },
  {
    path: '/forgotpassword',
    name: 'ForgotPassword',
    component: ForgotPassword,
    beforeEnter: checkAuth
  },
  {
    path: '/messages',
    name: 'Messages',
    component: Messages,
    beforeEnter: requireAuth
  },
  {
    path: '/queue',
    name: 'Open Ticket',
    component: OpenTicket,
    beforeEnter: requireAuth
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
  linkActiveClass: 'is-active',
  linkExactActiveClass: 'is-active'
})

Vue.use(VueRouter)
export default router
