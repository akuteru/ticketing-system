<template>
    <v-container fluid>
        <v-row>
            <h2 class="mb-4">Admin Dashboard</h2>
            <v-tabs
                v-model="tab"
            >
                <v-tabs-slider color="blue darken-4"></v-tabs-slider>

                <v-tab key="users">User list</v-tab>
                <v-tab key="approvals">Approval list</v-tab>
                <v-tab key="feedbacks">User Feedbacks</v-tab>
            </v-tabs>
            <v-tabs-items v-model="tab">
                <v-tab-item key="users">
                   <v-container fluid>
                        <v-data-table
                            :headers="userHeaders"
                            :items="users"
                            :items-per-page="20"
                            class="elevation-1"
                            
                        >
                            <template v-slot:item.viewAction="{item}">
                                <v-btn 
                                    small
                                    @click="viewUserInfo(item)">
                                    View user
                                </v-btn>
                            </template>
                            <template v-slot:item.profileImg="{item}"> 
                                <v-img width="48" height="48" class="rounded-circle my-2" aspect-ratio="1" :src="item.profileImg"></v-img>
                            </template>
                            <template v-slot:item.createdAt="{item}">
                                <span class="text-caption">{{getDate(item.createdAt)}}</span>
                            </template>
                            <template v-slot:item.gender="{item}">
                                <v-icon v-if="item.gender == 'Male'" color="blue darken-2">mdi-face-man</v-icon>
                                <v-icon v-else  color="pink lighten-1">mdi-face-woman</v-icon>
                            </template>
                            <template v-slot:item.studentCourse="{item}">
                                <span class="text-caption">{{item.studentCourse.code}}</span>
                            </template>
                        </v-data-table>
                    </v-container>
                </v-tab-item>
                <v-tab-item key="approvals">
                    <v-card flat>
                        <v-data-table
                            :headers="approvalHeaders"
                            :items="approvals"
                            :items-per-page="20"
                            class="elevation-1"
                        >
                            <template v-slot:item.actions="{item}">
                                <v-btn 
                                    small
                                    dark
                                    color="blue darken-1"
                                    @click="approve(item)">
                                    Approve
                                </v-btn>
                                <v-btn 
                                    color="red lighten-1"
                                    class="ml-2"
                                    dark
                                    small
                                    @click="reject(item)">
                                    Reject
                                </v-btn>
                            </template>
                            <template v-slot:item.requestDate="{item}">
                                <span class="text-caption">{{getDate(item.requestDate)}}</span>
                            </template>
                        </v-data-table>
                    </v-card>
                </v-tab-item>
                <v-tab-item key="feedbacks">
                    <v-card flat>
                        <v-data-table
                            :headers="feedbackHeaders"
                            :items="feedbacks"
                            :items-per-page="20"
                            class="elevation-1"
                        >
                            <template v-slot:item.userPhoto="{item}"> 
                                <v-img width="48" height="48" class="rounded-circle my-2" aspect-ratio="1" :src="item.userPhoto"></v-img>
                            </template>
                            <template v-slot:item.repPhoto="{item}"> 
                                <v-img width="48" height="48" class="rounded-circle my-2" aspect-ratio="1" :src="item.repPhoto"></v-img>
                            </template>
                            <template v-slot:item.avgRating="{item}"> 
                                <v-rating
                                    v-model="item.avgRating"
                                    background-color="orange lighten-3"
                                    color="orange"
                                    large
                                ></v-rating>
                            </template>
                            <template v-slot:item.action="{item}">
                                <v-btn 
                                    small
                                    @click="viewUserInfo(item)">
                                    View feedback
                                </v-btn>
                            </template>
                            
                        </v-data-table>
                    </v-card>
                </v-tab-item>
            </v-tabs-items>
        </v-row>
        <v-dialog
            v-model="loadingDialog"
            hide-overlay
            persistent
            width="300"
            >
            <v-card
                color="primary"
                dark
            >
                <v-card-text>
                {{loadingText}}
                <v-progress-linear
                    indeterminate
                    color="white"
                    class="mb-0"
                ></v-progress-linear>
                </v-card-text>
            </v-card>
        </v-dialog>
        <v-snackbar
            v-model="snackbar"
            :timeout="snackbarTimeout"
            elevation="24"
            color="blue darken-2"
            >
            {{ snackbarText }}

            <template v-slot:action="{ attrs }">
                <v-btn
                color="white"
                text
                v-bind="attrs"
                @click="snackbar = false"
                >
                Close
                </v-btn>
            </template>
        </v-snackbar>
    </v-container>
</template>
<script>
import { onUnmounted } from 'vue'
import moment from 'moment'
import firebase from '../firebase/index'
let firestore = firebase.firestore
let auth = firebase.auth
export default {
    data: () => ({
        tab: null,
        snackbar: false,
        loadingDialog: false,
        snackbarTimeout: 2500,
        snackbarText: '',
        loadingText: 'Processing...',
        approvalHeaders: [
            {text : 'Requested by', sortable: false, value:'requestedBy'},
            {text : 'Requested Role', sortable: false, value:'requestedRole'},
            {text : 'Date', sortable: true, value:'requestDate'},
            {text : '', sortable: false, value:'actions'},
        ],
        userHeaders: [
            {text : 'Image', sortable: true, value:'profileImg'},
            {text : 'Last Name', sortable: true, value:'lastName'},
            {text : 'First Name', sortable: false, value:'firstName'},
            {text : 'Role', sortable: false, value:'roleName'},
            {text : 'Gender', sortable: false, value:'gender'},
            {text : 'Department', sortable: false, value:'department'},
            {text : 'Course', sortable: false, value:'studentCourse'},
            {text : 'Registration Date', sortable: true, value:'createdAt'},
            {text : '', sortable: false, value:'viewAction'}
        ],
        feedbackHeaders: [
            {text : '', sortable: false, value:'userPhoto'},
            {text : 'Submitted by', sortable: true, value:'userFullName'},
            {text : '', sortable: false, value:'repPhoto'},
            {text : 'Accomodated by', sortable: false, value:'repFullName'},
            {text : 'Average Rating', sortable: true, value: 'avgRating'},
            {text : '', sortable: false, value: 'action'}
        ],
        users: [],
        approvals: [],
        feedbacks: []
    }),
    methods: {
        getAverageScore(item1, item2, item3, item4, item5, item6){
            return (item1 + item2 + item3 + item4 + item5 + item6) / 6
        },
        getDate(firebaseTimestamp){
            return moment(firebaseTimestamp.toDate()).format('MMMM Do YYYY')
        },
        viewFeedback(feedback){

        },
        viewUserInfo(user){

        },
        approve(item){
            this.loadingDialog = true
            var batch = firestore.batch()
            const userRef = firestore.collection('user').doc(item.requestedById)
            const approvalRef = firestore.collection('approval').doc(item.id)
            batch.update(userRef, {roleName: item.requestedRole})
            batch.delete(approvalRef)
            batch.commit().then(() => {
                this.loadingDialog = false
                this.snackbar = true
                this.snackbarText = "User request has been approved"
            })
        },
        reject(item){
            this.loadingDialog = true
            const approvalRef = firestore.collection('approval').doc(item.id)
            approvalRef.delete().then(() => {
                this.loadingDialog = false
                this.snackbar = true
                this.snackbarText = "User request has been rejected"
            })
        }
    },
    mounted(){
        const userCollection = firestore.collection('user').orderBy('createdAt','desc')
        const approvalCollection = firestore.collection('approval').orderBy('requestDate','desc')
        const feedbackCollection = firestore.collection('feedback').orderBy('createdAt', 'desc')

        var userQuery = userCollection.onSnapshot((snapshot) => {
            const userData = []
            snapshot.forEach((doc) => {
                userData.push({
                    id: doc.id,
                    lastName: doc.data().lastName,
                    firstName: doc.data().firstName,
                    middleName: doc.data().middleName,
                    roleName: doc.data().roleName,
                    department: doc.data().department,
                    studentCourse: doc.data().studentCourse,
                    profileImg: doc.data().profileImg,
                    birthDate: doc.data().birthDate,
                    gender: doc.data().gender,
                    address: doc.data().address,
                    createdAt: doc.data().createdAt,
                    openTickets: doc.data().openTickets,
                    totalTickets: doc.data().totalTickets,
                    closedTickets: doc.data().closedTickets,
                    viewAction: ''
                })
            })
            this.users = userData
        })
        var approvalQuery = approvalCollection.onSnapshot((snapshot) => {
            const approvalData = []
            snapshot.forEach((doc) => {
                approvalData.push({
                    id: doc.id,
                    requestDate: doc.data().requestDate,
                    requestedBy: doc.data().requestedBy,
                    requestedById: doc.data().requestedById,
                    requestedRole: doc.data().requestedRole,
                    actions: ''
                })
            })
            this.approvals = approvalData
        })
        var feedbackQuery = feedbackCollection.onSnapshot((snapshot) => {
            const feedbackData = []
            snapshot.forEach((doc) => {
                feedbackData.push({
                    id: doc.id,
                    ticketId: doc.data().ticketId,
                    userId: doc.data().userId,
                    userFullName: doc.data().userFullName,
                    userPhoto: doc.data().userPhoto,
                    repId: doc.data().repId,
                    repFullName: doc.data().repFullName,
                    repPhoto: doc.data().repPhoto,
                    item1: doc.data().item1,
                    item2: doc.data().item2,
                    item3: doc.data().item3,
                    item4: doc.data().item4,
                    item5: doc.data().item5,
                    item6: doc.data().item6,
                    providedDetails: doc.data().providedDetails,
                    incidentDetails: doc.data().incidentDetails,
                    recommendation: doc.data().recommendation,
                    createdAt: doc.data().createdAt,
                    action: '',
                    avgRating: this.getAverageScore(doc.data().item1,doc.data().item2,doc.data().item3,doc.data().item4,doc.data().item5,doc.data().item6)
                })
            })
        })
        onUnmounted(userQuery, approvalQuery, feedbackQuery)
    }
}
</script>