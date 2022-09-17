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
                            <template v-slot:item.requestedCourse="{item}">
                                <span class="text-caption">{{item.requestedCourse.code}}</span>
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
                                    @click="viewFeedback(item)">
                                    View feedback
                                </v-btn>
                                <v-btn 
                                    class="ml-2"
                                    small
                                    @click="printFeeback(item)">
                                    Print feedback
                                </v-btn>
                            </template>
                            
                            <template v-slot:item.createdAt="{item}">
                                <span class="text-caption">{{getDate(item.createdAt)}}</span>
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
        <v-dialog
            v-model="feedbackDialog"
            max-width="800px"
            >
            <v-card>
                <v-card-title>
                    <span class="text-h5">ASCAT Customer Feedback</span>
                </v-card-title>
                <v-card-subtitle>
                    <span class="subtitle">Please let us know how we served you. This form may be used for compliment, suggestion and/or complaint</span>
                </v-card-subtitle>
                <v-divider></v-divider>
                <v-card-text class="mt-4">
                    <span>1. How satisfied were you in terms of response time to your transaction given by the office?</span>
                    <v-rating
                        empty-icon="mdi-star-outline"
                        full-icon="mdi-star"
                        half-icon="mdi-star-half-full"
                        hover
                        length="5"
                        size="32"
                        readonly
                        color="yellow"
                        v-model="selectedFeedback.item1"
                    ></v-rating>
                    <span>2. How satisfied were you with the outcome of the service provided?</span>
                    <v-rating
                        empty-icon="mdi-star-outline"
                        full-icon="mdi-star"
                        half-icon="mdi-star-half-full"
                        hover
                        length="5"
                        size="32"
                        readonly
                        color="yellow"
                        v-model="selectedFeedback.item2"
                    ></v-rating>
                    <span>3. How satisfied were you with the service provider's extensive information /understanding of the service being provided?</span>
                    <v-rating
                        empty-icon="mdi-star-outline"
                        full-icon="mdi-star"
                        half-icon="mdi-star-half-full"
                        hover
                        length="5"
                        readonly
                        size="32"
                        color="yellow"
                        v-model="selectedFeedback.item3"
                    ></v-rating>
                    <span>4. How satisfied were you with the service provider's competence or the skill in delivering service?</span>
                    <v-rating
                        empty-icon="mdi-star-outline"
                        full-icon="mdi-star"
                        half-icon="mdi-star-half-full"
                        hover
                        length="5"
                        size="32"
                        readonly
                        color="yellow"
                        v-model="selectedFeedback.item4"
                    ></v-rating>
                    <span>5. How satisfied were you with the service provider's friendliness, courteousness/politeness, fair treatment and willingness to do more then what is expected or going to extra mile?</span>
                    <v-rating
                        empty-icon="mdi-star-outline"
                        full-icon="mdi-star"
                        half-icon="mdi-star-half-full"
                        hover
                        length="5"
                        size="32"
                        readonly
                        color="yellow"
                        v-model="selectedFeedback.item5"
                    ></v-rating>
                    <span>6. How would you rate our <strong>OVERALL SATISFACTION</strong> with regard to the quality of service delivery?</span>
                    <v-rating
                        empty-icon="mdi-star-outline"
                        full-icon="mdi-star"
                        half-icon="mdi-star-half-full"
                        hover
                        length="5"
                        size="32"
                        readonly
                        color="yellow"
                        v-model="selectedFeedback.item6"
                    ></v-rating>
                    <v-text-field
                        v-model="selectedFeedback.providedDetails"
                        readonly
                        label="Inquiry type"
                        outlined
                        clearable
                        class="mt-2"
                    ></v-text-field>
                    <v-textarea
                        outlined
                        readonly
                        label="Facts or details about the indcident"
                        v-model="selectedFeedback.incidentDetails"
                    >
                    </v-textarea>
                    <v-textarea
                        readonly
                        outlined
                        label="Recommendation/Suggestion/Desired Action from the Office"
                        v-model="selectedFeedback.recommendation"
                    >
                    </v-textarea>
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
        <v-card id="feedbackForm" ref="feedbackForm" style="display: none;">
            <v-card-title>
                <span class="text-h5">ASCAT Customer Feedback</span>
            </v-card-title>
            <v-divider></v-divider>
            <div style="display:flex; margin-top: 10px; margin-left: 15px; align-items: center">
                <img v-bind:src="selectedFeedback.userPhoto" style="width: 64px; height: auto;"/>
                <div style="display: flex; flex-direction: column; margin-left: 15px;">
                    <span>Submitted by:</span>
                    <h4>{{selectedFeedback.userFullName}}</h4>
                </div>
            </div>
            <div style="display:flex; margin-top: 10px; margin-left: 15px; align-items: center">
                <img v-bind:src="selectedFeedback.repPhoto" style="width: 64px; height: auto;"/>
                <div style="display: flex; flex-direction: column; margin-left: 15px;">
                    <span>Accommodated by:</span>
                    <h4>{{selectedFeedback.repFullName}}</h4>
                </div>
            </div>
            <div style="display:flex; margin-top: 10px; flex-direction: column; margin-left: 15px;">
                <span>Department:</span>
                <h4>{{selectedFeedback.department}}</h4>
            </div>
            <div style="display:flex; margin-top: 10px; flex-direction: column; margin-left: 15px; margin-bottom: 20px;">
                <span>Date of Submission:</span>
                <h4>{{getDate(selectedFeedback.createdAt)}}</h4>
            </div>
            <v-card-text class="mt-4">
                <span>1. How satisfied were you in terms of response time to your transaction given by the office?</span>
                <v-rating
                    empty-icon="mdi-star-outline"
                    full-icon="mdi-star"
                    half-icon="mdi-star-half-full"
                    hover
                    length="5"
                    size="32"
                    readonly
                    color="yellow"
                    v-model="selectedFeedback.item1"
                ></v-rating>
                <span>2. How satisfied were you with the outcome of the service provided?</span>
                <v-rating
                    empty-icon="mdi-star-outline"
                    full-icon="mdi-star"
                    half-icon="mdi-star-half-full"
                    hover
                    length="5"
                    size="32"
                    readonly
                    color="yellow"
                    v-model="selectedFeedback.item2"
                ></v-rating>
                <span>3. How satisfied were you with the service provider's extensive information /understanding of the service being provided?</span>
                <v-rating
                    empty-icon="mdi-star-outline"
                    full-icon="mdi-star"
                    half-icon="mdi-star-half-full"
                    hover
                    length="5"
                    readonly
                    size="32"
                    color="yellow"
                    v-model="selectedFeedback.item3"
                ></v-rating>
                <span>4. How satisfied were you with the service provider's competence or the skill in delivering service?</span>
                <v-rating
                    empty-icon="mdi-star-outline"
                    full-icon="mdi-star"
                    half-icon="mdi-star-half-full"
                    hover
                    length="5"
                    size="32"
                    readonly
                    color="yellow"
                    v-model="selectedFeedback.item4"
                ></v-rating>
                <span>5. How satisfied were you with the service provider's friendliness, courteousness/politeness, fair treatment and willingness to do more then what is expected or going to extra mile?</span>
                <v-rating
                    empty-icon="mdi-star-outline"
                    full-icon="mdi-star"
                    half-icon="mdi-star-half-full"
                    hover
                    length="5"
                    size="32"
                    readonly
                    color="yellow"
                    v-model="selectedFeedback.item5"
                ></v-rating>
                <span>6. How would you rate our <strong>OVERALL SATISFACTION</strong> with regard to the quality of service delivery?</span>
                <v-rating
                    empty-icon="mdi-star-outline"
                    full-icon="mdi-star"
                    half-icon="mdi-star-half-full"
                    hover
                    length="5"
                    size="32"
                    readonly
                    color="yellow"
                    v-model="selectedFeedback.item6"
                ></v-rating>
                <h4>Type of Inquiry</h4>
                <br/>
                <p><strong>- {{selectedFeedback.providedDetails}}</strong></p>
                <br/>
                <h4>Facts or details about the indcident</h4>
                <br/>
                <p><strong>- {{selectedFeedback.incidentDetails}}</strong></p>
                <br/>
                <h4>Recommendation/Suggestion/Desired Action from the Office</h4>
                <br/>
                <p><strong>- {{selectedFeedback.recommendation}}</strong></p>
                <br>
                <br>
            </v-card-text>
        </v-card>
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
        selectedFeedback: {},
        snackbar: false,
        loadingDialog: false,
        feedbackDialog: false,
        snackbarTimeout: 2500,
        snackbarText: '',
        loadingText: 'Processing...',
        approvalHeaders: [
            {text : 'Requested by', sortable: false, value:'requestedBy'},
            {text : 'Requested Role', sortable: false, value:'requestedRole'},
            {text : 'Requested Department', sortable: false, value:'requestedDepartment'},
            {text : 'Requested Course', sortable: false, value:'requestedCourse'},
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
            {text : '', sortable: false, value: 'action'},
            {text : 'Date created', sortable: true, value: 'createdAt'}
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
            if(firebaseTimestamp == null){ return ''}
            
            return moment(firebaseTimestamp.toDate()).format('MMMM Do YYYY hh:mm a')
        },
        viewFeedback(feedback){
            this.selectedFeedback = feedback
            this.feedbackDialog = true
        },
        printFeeback(feedback){
            this.loadingDialog = true
            this.loadingText = "Generating print form..."
            this.selectedFeedback = feedback
            const modCollection = firestore.collection('user').doc(this.selectedFeedback.repId)
            modCollection.get().then((doc) => {
                this.selectedFeedback.department = doc.data().department
                this.loadingDialog = false
                this.$htmlToPaper('feedbackForm')
            })
            .catch((err) => {
                this.loadingDialog = false
            })
            setTimeout(() => {
                
            }, 2500)
        },
        viewUserInfo(user){

        },
        approve(item){
            this.loadingDialog = true
            var batch = firestore.batch()
            const userRef = firestore.collection('user').doc(item.requestedById)
            const approvalRef = firestore.collection('approval').doc(item.id)
            batch.update(userRef, {
                roleName: item.requestedRole,
                department: item.requestedDepartment,
                studentCourse: item.requestedCourse 
            })
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
                    requestedDepartment: doc.data().requestedDepartment,
                    requestedCourse: doc.data().requestedCourse,
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
                    department: '',
                    avgRating: this.getAverageScore(doc.data().item1,doc.data().item2,doc.data().item3,doc.data().item4,doc.data().item5,doc.data().item6)
                })
            })
            this.feedbacks = feedbackData
        })
        onUnmounted(userQuery, approvalQuery, feedbackQuery)
    }
}
</script>