<template>
    <v-navigation-drawer
        class="indigo darken-3"
        elevation="2"
        dark
        fixed
        expand-on-hover
    >
    <v-list-item class="px-2">
        <v-list-item-avatar>
            <v-img elevation="2" src="../assets/asscat-logo.png"></v-img>
        </v-list-item-avatar>
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
    
</template>
<script>
    import { mapGetters } from 'vuex'
    import firebase from 'firebase'
    export default{
        name: 'Header',
        data: () => ({
            menuDrawer: false,
            menuList: [
                { title: 'Dashboard', icon: 'mdi-view-dashboard', link: '/', adminAccess: false },
                { title: 'Messages', icon: 'mdi-forum', link: '/messages', adminAccess: false },
                { title: 'Profile', icon: 'mdi-account-circle', link: '/profile', adminAccess: false },
                { title: 'Approvals', icon: 'mdi-check', adminAccess: true },
                { title: 'Help desk', icon: 'mdi-help-box', adminAccess: false },
            ]
        }),
        computed: {
            ...mapGetters({
                user: 'userInfo'
            }),
            initial(){
                const email = this.user.data.email
                let result = email.substring(0,2)
                return result
            }
        },
        methods: {
            signOut(){
                firebase
                    .auth()
                    .signOut()
                    .then(() => {
                        location.reload()
                    })
            }
        }
    }
</script>