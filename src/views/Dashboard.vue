<template>
    <v-container fluid>
        <AdminDashboard v-if="isAdministrator" />
        <v-row v-else>
            <v-col cols="12">
                <span class="text-h6">Welcome, {{userInfo.firstName}} {{userInfo.lastName}}</span>
            </v-col>
            <v-col md="4" sm="12">
                <v-card v-if="isModerator" class="px-3">
                    <div class="d-flex flex-row">
                        <lottie :options="defaultOptions" :height="210" :width="210" class=""/>
                        <div class="d-flex flex-column ml-2 justify-center">
                            <span class="text-subtitle-2 blue--text text--darken-4">Feedback</span>
                            <span class="text-caption">Do you have concerns, complaints or inquiries? Feel free to message us.</span>
                            
                        </div>
                    </div>
                </v-card>
                <v-card v-else class="px-3">
                    <div class="d-flex flex-row">
                        <lottie :options="defaultOptions" :height="210" :width="210" class=""/>
                        <div class="d-flex flex-column ml-2 justify-center">
                            <span class="text-subtitle-2 blue--text text--darken-4">Need help?</span>
                            <span class="text-caption">Do you have concerns, complaints or inquiries? Feel free to message us.</span>
                            <v-btn color="blue darken-4" 
                                dark 
                                x-small
                                height="25"
                                @click="openTicketDialog"
                                class="d-flex flex-grow-0 flex-shrink-1 mt-1">
                                <span>Open a ticket</span>
                            </v-btn>
                        </div>
                    </div>
                </v-card>
            </v-col>
            <v-col md="4" sm="12">
                <v-card class="px-3">
                    <div class="d-flex flex-row">
                        <lottie :options="defaultOptions2" :height="210" :width="210"/>
                        <div class="d-flex flex-column ml-2 justify-center">
                            <span class="text-subtitle-2 blue--text text--darken-4">Your have <strong>{{userInfo.openTickets}}</strong> open tickets.</span>
                            <span v-if="isModerator" class="text-caption">That's out of <strong>{{userInfo.totalTickets}}</strong> total tickets! Tickets that you accepted and hasn't been closed are counted as open tickets</span>
                            <span v-else class="text-caption">That's out of <strong>{{userInfo.totalTickets}}</strong> total tickets! Only tickets that is still pending to be accepted by our representative is counted as open tickets.</span>
                        </div>
                    </div>
                </v-card>
            </v-col>
             <v-col md="4" sm="12">
                <v-card class="px-3">
                    <div class="d-flex flex-row">
                        <lottie :options="defaultOptions3" :height="210" :width="210"/>
                        <div class="d-flex flex-column ml-2 justify-center">
                            <span class="text-subtitle-2 blue--text text--darken-4">Your have <strong>{{userInfo.closedTickets}}</strong> closed tickets.</span>
                            <span class="text-caption">Hooray! That's out of <strong>{{userInfo.totalTickets}}</strong> total tickets! Closed tickets count are based on resolved tickets.</span>
                        </div>
                    </div>
                </v-card>
            </v-col>
        </v-row>

        <v-dialog
            v-model="createTicketDialog"
            max-width="800px"
            >
            <v-card>
                <v-card-title>
                    <span class="text-h5">Select a department</span>
                </v-card-title>
                <v-card-subtitle>
                    <span class="subtitle">Please wait for a representative to respond to your ticket.</span>
                </v-card-subtitle>
                <v-card-text>
                    <v-combobox
                        filled
                        outlined
                        label="Department"
                        v-model="selectedDepartment"
                        :items="departmentItems"
                    ></v-combobox>
                    <v-textarea
                        outlined
                        label="Inquiry/Question"
                        v-model="description"
                    >
                    </v-textarea>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="blue darken-4"
                        text
                        @click="createTicketDialog = false"
                    >
                        Close
                    </v-btn>
                    <v-btn
                        color="blue darken-4"
                        text
                        @click="createTicket()"
                    >
                        Create Ticket
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
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
    import Lottie from '../components/Lottie.vue'
    import supportAnimationData from '../assets/lotties/support.json'
    import feedbackAnimationData from '../assets/lotties/feedback.json'
    import winnerAnimationData from '../assets/lotties/winner.json'
    import firebase from '../firebase/index'
    import AdminDashboard from '../components/AdminDashboard.vue'
    let firestore = firebase.firestore
    let auth = firebase.auth
    export default{
        data: () => ({
            defaultOptions: {animationData: supportAnimationData},
            defaultOptions2: {animationData: feedbackAnimationData},
            defaultOptions3: {animationData: winnerAnimationData},
            animationSpeed: 1,
            userInfo: {},
            feedbacks: [],
            createTicketDialog: false,
            loadingText: 'Creating ticket...',
            loadingDialog: false,
            snackbar: false,
            snackbarTimeout: 2000,
            snackbarText: '',
            selectedDepartment: '',
            description: '',
            departmentItems: [
                'College of Engineering and Information Sciences',
                'College of Agriculture',
                'College of Arts and Sciences',
                'College of Teacher Education',
                'Office of Student Affair Services'
            ],
        }),
        mounted() {
            document.title = "Dashboard - Stakeholders Online Support"

            const userId = auth.currentUser.uid
            const feedbackCollection = firestore.collection('feedback')
            const userCollection = firestore.collection('user').doc(userId)
            var feedbackQuery = feedbackCollection.where('repId','==',userId)
            userCollection.get().then((doc) => {
                this.userInfo = doc.data()
            })
            var unsubscribe = feedbackQuery.onSnapshot((snapshot) => {
                const feedbacks = []
                snapshot.forEach((doc) => {
                    feedbacks.push(doc.data())
                })
            })
            onUnmounted(unsubscribe)
        },
        components: {
            'lottie': Lottie,
            AdminDashboard
        },
        methods: {
            openTicketDialog(){
                this.createTicketDialog = true
                this.selectedDepartment = this.userInfo.department
            },
            createTicket(){
                this.loadingText = 'Creating ticket...'
                this.loadingDialog = true
                const userId = firebase.auth.currentUser.uid
                const fullName = this.userInfo.firstName + ' ' + this.userInfo.lastName
                const ticketData = {
                    authorName: fullName,
                    authorImage: this.userInfo.profileImg,
                    createdById: userId,
                    description: this.description,
                    department: this.selectedDepartment,
                    createdAt: firebase.fieldValue.serverTimestamp()
                }
                var batch = firestore.batch()
                const openTicketRef = firebase.firestore.collection('openTicket').doc();
                const userRef = firebase.firestore.collection('user').doc(userId)
                batch.set(openTicketRef, ticketData)
                batch.update(userRef, {
                    openTickets: firebase.fieldValue.increment(1),
                    totalTickets: firebase.fieldValue.increment(1)
                })
                batch.commit().then(() => {
                    this.createTicketDialog = false
                    this.loadingDialog = false
                    this.snackbarText = "Ticket with id has been created. Please wait until a representative reply to your ticket"
                    this.snackbar = true
                })
            },
            initializeTicket(){

            },
            handleAnimation(anim) {
                this.anim = anim;
            },
        },
        computed:{
            isAdministrator(){
                return this.userInfo.roleName == 'Administrator' 
            },
            isModerator(){
                return this.userInfo.roleName == 'Administrator' || this.userInfo.roleName == 'Moderator'
            }
        }
    }
</script>
<style scoped>
    .v-sheet--offset {
        top: -24px;
        position: relative;
    }
</style>