<template>
  <v-app>
    <v-card class="overflow-hidden rounded-0">
      <v-app-bar
        absolute
        class="indigo darken-3 rounded-0"
        dark
        elevate-on-scroll
        scroll-target="#body-scrolling"
        v-if="user.loggedIn"
      >
        <v-app-bar-nav-icon @click="menuDrawer = true"></v-app-bar-nav-icon>
        <v-spacer></v-spacer>
        <v-toolbar-title class="text-h6">Stakeholder Online Support</v-toolbar-title>

        <v-spacer></v-spacer>

        <!-- <v-btn icon>
          <v-icon>mdi-magnify</v-icon>
        </v-btn>

        <v-btn icon>
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn> -->
      </v-app-bar>
      <v-navigation-drawer
          v-model="menuDrawer"
          fixed
          temporary
      >
      <v-list-item class="px-2">
          <v-list-item-title>Stakeholder Online Support</v-list-item-title>
      </v-list-item>

      <v-divider></v-divider>
      
      <v-list
          nav
          dense
          >
          <v-list-item
              v-for="item in menuList"
              :key="item.title"
              :to="item.link"
              link>
              <v-list-item-icon>
                  <v-icon>{{ item.icon }}</v-icon>
              </v-list-item-icon>

              <v-list-item-content>
                  <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item-content>
          </v-list-item>
          </v-list>
          <template v-slot:append>
          <v-list nav dense>
              <v-list-item link>
              <v-list-item-icon>
                  <v-icon>mdi-cog</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                  <v-list-item-title>Settings</v-list-item-title>
              </v-list-item-content>
              </v-list-item>
              <v-list-item link @click="signOut"> 
                  <v-list-item-icon>
                      <v-icon>mdi-logout</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                      <v-list-item-title>Logout</v-list-item-title>
                  </v-list-item-content>
              </v-list-item>
          </v-list>
          </template>
      </v-navigation-drawer>
      <v-sheet id="body-scrolling"
          class="overflow-y-auto blue-grey lighten-5"
          max-height="100vh">
        <v-container fluid class="p-0" style="min-height: 100vh;">
          <v-main class="p-4 pt-16">
            <router-view/>
          </v-main>
        </v-container>
      </v-sheet>
    </v-card>
  </v-app>
</template>

<script>
import {mapGetters} from 'vuex'
import firebase from './firebase/index'
export default {
    name: "App",
    data: () => ({
      menuDrawer: false,
      userData: {},
      menuList: [
          { title: 'Dashboard', icon: 'mdi-view-dashboard', link: '/' },
          { title: 'My Tickets', icon: 'mdi-forum', link: '/messages' },
          { title: 'My Profile', icon: 'mdi-account-circle', link: '/profile' },
          { title: 'Open Tickets', icon: 'mdi-help-box', link: '/queue' },
      ]
    //
    }),
    methods: {
        signOut(){
            firebase
                .auth
                .signOut()
                .then(() => {
                    location.reload()
                })
        }
      },
    created(){
        if(firebase.auth.currentUser == null) {return}
        const userId = firebase.auth.currentUser.uid;
        const userCollection = firebase.firestore.collection('user').doc(userId)
            userCollection.get().then((doc) => {
                // const userInfo = doc.data()
                const userInfo = {
                    lastName: doc.data().lastName,
                    firstName: doc.data().firstName,
                    middleName: doc.data().middleName,
                    roleName: doc.data().roleName,
                    department: doc.data().department,
                    studentCourse: doc.data().studentCourse,
                    profileImg: doc.data().profileImg,
                    birthDate: doc.data().birthDate,
                    address: doc.data().address,
                    createdAt: doc.data().createdAt
                }
                this.userData = userInfo
            })
    },
    computed:{
      ...mapGetters({
        user: 'userInfo'
      }),
      initial(){
          const email = this.user.data.email
          let result = email.substring(0,2)
          return result
      }
    }
};
</script>
<style>
  
</style>
