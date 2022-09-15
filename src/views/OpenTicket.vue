<template>
    <v-container fluid>
        <v-card>
            <v-toolbar elevation="0">
                <v-toolbar-title v-if="hasAccess">
                    <span class="text-h6">{{userInfo.department}}</span>
                    <small class="ml-2">(Open tickets for this department)</small>
                </v-toolbar-title>
                <v-toolbar-title v-else>
                    <span class="text-h6">My Open Tickets</span>
                </v-toolbar-title>
                <v-spacer></v-spacer>
            </v-toolbar>
            <v-divider></v-divider>
            <v-row>
               <v-col
                    v-for="(ticket, i) in tickets"
                    :key="i"
                    cols="12"
                    md="4"
                >
                    <v-item>
                        <v-card
                            color="teal lighten-1"
                            dark
                        >
                            <div class="d-flex flex-no-wrap justify-space-between py-2">
                                <div class="mt-n2">
                                    <v-card-title
                                        class="text-h6"
                                        v-text="ticket.authorName"
                                    ></v-card-title>
                                    <v-card-subtitle class="text-caption" v-text="ticket.description"></v-card-subtitle>
                                    <v-spacer></v-spacer>
                                    <span class="ml-4 text-caption">
                                        <v-icon size="12" class="mr-1">mdi-clock</v-icon>
                                        {{getDate(ticket.createdAt)}}
                                    </span>
                                </div>
                                <v-avatar
                                    class="ma-3 rounded-circle"
                                    size="80"
                                    tile
                                >
                                    <v-img :src="ticket.authorImage"></v-img>
                                </v-avatar>
                            </div>
                            <v-divider></v-divider>
                            <v-card-actions>
                                <v-btn
                                    small
                                    v-if="hasAccess"
                                    right
                                    light
                                    text
                                    dark
                                    @click="viewTicketInformation(ticket)"
                                >
                                    View information
                                </v-btn>
                                <v-spacer></v-spacer>
                                <v-btn
                                    small
                                    v-if="hasAccess"
                                    right
                                    light
                                    @click="onRejectDialog(ticket)"
                                >
                                    Reject
                                </v-btn>
                                <v-btn
                                    small
                                    v-if="hasAccess"
                                    right
                                    light
                                    @click="onAcceptTicketDialog(ticket)"
                                >
                                    Accept
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-item>
                </v-col>
            </v-row>
        </v-card>
        <v-dialog
            v-model="acceptTicketDialog"
            width="500"
            >
            <v-card >
                <v-card-title class="text-h6 grey lighten-2">
                   {{confirmTicketText}}
                </v-card-title>
                <v-card-text class="py-5">
                    <span class="text-subtitle">{{selectedTicket.authorName}}</span>
                    <br>
                    <span class="text-body">{{selectedTicket.description}}</span>
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions>
                <v-btn
                    color="primary"
                    small
                    text
                    @click="cancel"
                >
                    Cancel
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn
                    color="primary"
                    small
                    text
                    @click="proceedConfirmTicket"
                >
                    Proceed
                </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog
            v-model="viewTicketDialog"
            max-width="720">
            <v-card>
                <v-img :src="selectedTicket.authorImage" height="150"></v-img>
                <v-card-title>
                    <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                            <v-icon size="18" class="mr-1" color="teal lighten-1" 
                            v-bind="attrs"
                            v-on="on">mdi-account</v-icon>
                        </template>
                        <span>{{ticketUserInfo.roleName}}</span>
                    </v-tooltip>
                    <span class="teal--text text--lighten-1">{{selectedTicket.authorName}}</span>
                    <v-icon size="18" class="ml-1" v-if="ticketUserInfo.gender == 'Male'" color="blue darken-2">mdi-gender-male</v-icon>
                    <v-icon size="18" class="ml-1" v-else-if="ticketUserInfo.gender == 'Female'" color="pink lighten-1">mdi-gender-female</v-icon>
                    <v-icon size="18" class="ml-1" v-else>mdi-gender-male-female</v-icon>
                </v-card-title>
                <v-card-subtitle>
                    <span>{{ticketUserInfo.department}}</span> 
                    - 
                    <span v-if="ticketUserInfo.studentCourse != null">{{ticketUserInfo.studentCourse.code}}</span>
                </v-card-subtitle>
                <v-card-text>
                    <v-textarea
                        label="Concern"
                        outlined
                        disabled
                        flat
                        rows="2"
                        v-model="selectedTicket.description"></v-textarea>
                </v-card-text>
                <v-card-actions>
                    <v-btn
                        small
                        light
                        text
                        @click="viewTicketDialog = false"
                    >
                        Close
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn
                        small
                        right
                        light
                        dark
                        color="red lighten-1"
                        @click="onRejectFromDialog()"
                    >
                        Reject
                    </v-btn>
                    <v-btn
                        small
                        right
                        light
                        dark
                        color="teal lighten-1"
                        @click="onAcceptTicketFromDialog()"
                    >
                        Accept
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
    import firebase from '../firebase/index'
    import moment from 'moment'
    const firestore = firebase.firestore
    const auth = firebase.auth
    export default {
        data(){
            return{
                loadingDialog: false,
                loadingText: 'Accepting ticket...',
                viewTicketDialog: false,
                snackbar: false,
                snackbarTimeout: 2000,
                isAccept: false,
                snackbarText: '',
                selectedOpenTicketId: '',
                selectedDepartment: '',
                acceptTicketDialog: false,
                confirmTicketText: '',
                tickets: [],
                selectedTicket: '',
                userInfo: {
                    lastName: '',
                    firstName: '',
                    middleName: '',
                    roleName: '',
                    department: '',
                    studentCourse: '',
                    profileImg: '',
                    birthDate: '',
                    address: '',
                    createdAt: '',
                    openTickets: 0,
                    totalTickets: 0,
                    closedTickets: 0
                },
                ticketUserInfo: {}
            }
        },
        computed:{
            hasAccess(){
                return this.userInfo.roleName !== 'Student'
            }
        },
        async mounted(){ 
            document.title = "Open Tickets - Stakeholders Online Support"
            await this.getUserInfo()
            console.log(this.userInfo.department)
            let queryField = "department"
            let queryValue = this.userInfo.department
            if(this.userInfo.roleName == 'Student'){
                queryField = "createdById"
                queryValue = auth.currentUser.uid
            }
            const ticketCollection = firestore.collection('openTicket').where(queryField,"==",queryValue)
            const query = ticketCollection.orderBy('createdAt', 'desc')
            query.onSnapshot(snapshot => {
                const tickets = [];
                snapshot.forEach((doc) => {  
                    tickets.push({
                        id: doc.id,
                        authorName: doc.data().authorName,
                        authorImage: doc.data().authorImage,
                        createdById: doc.data().createdById,
                        description: doc.data().description,
                        department: doc.data().department,
                        createdAt: doc.data().createdAt
                    })
                })
                this.tickets = tickets;
            })
           
        },
        methods: {
            async getUserInfo(){
                const userId = auth.currentUser.uid;
                const userCollection = firestore.collection('user').doc(userId)
                return userCollection.get().then((doc) => {
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
                    this.userInfo = userInfo
                })
            },
            viewTicketInformation(ticket){
                const userId = ticket.createdById
                const userCollection = firestore.collection('user').doc(userId)
                var userData = []
                userCollection.get().then((doc) => {
                    userData = doc.data()
                    this.selectedTicket = ticket
                    this.ticketUserInfo = userData
                    this.viewTicketDialog = true
                })
            },
            createTicket(){
                this.createTicketDialog = false
            },
            ticketSelected(ticketId){
                if(typeof ticketId !== 'undefined'){
                    this.selectedTicketId = ticketId
                }   
            },
            onRejectDialog(ticket){
                this.selectedTicket = ticket
                this.isAccept = false
                this.confirmTicketText = 'Reject this ticket?'
                this.acceptTicketDialog = true
            },
            onRejectFromDialog(){
                this.proceedReject()
            },
            onAcceptTicketDialog(ticket){
                this.selectedTicket = ticket
                this.isAccept = true
                this.confirmTicketText = 'Accept this ticket?'
                this.acceptTicketDialog = true
            },
            onAcceptTicketFromDialog(){
                this.proceedAccept()
            },
            proceedConfirmTicket(){
                if(this.isAccept){
                    this.proceedAccept()
                }
                else{
                    this.proceedReject()
                }
            },
            proceedReject(){
                this.acceptTicketDialog = false
                this.loadingText = 'Rejecting ticket...'
                this.loadingDialog = true
                const openTicketRef = firebase.firestore.collection('openTicket').doc(this.selectedTicket.id)
                const studentUserRef = firebase.firestore.collection('user').doc(this.selectedTicket.createdById)
                var batch = firebase.firestore.batch()

                batch.delete(openTicketRef)
                batch.update(studentUserRef, {
                    openTickets: firebase.fieldValue.increment(-1)
                })
                batch.commit().then(() => {
                    this.loadingDialog = false
                    this.selectedTicket = {}
                    this.snackbar = true
                    this.snackbarText = "Ticket has been rejected."
                })
            },
            proceedAccept(){
                this.acceptTicketDialog = false
                this.loadingText = 'Accepting ticket...'
                this.loadingDialog = true
                const userId = firebase.auth.currentUser.uid
                const ticketData = {
                    authorName: this.selectedTicket.authorName,
                    authorImage: this.selectedTicket.authorImage,
                    acceptedById: userId,
                    acceptedByName: this.userInfo.firstName + " " + this.userInfo.lastName,
                    acceptedByImage: this.userInfo.profileImg,
                    createdAt: firebase.fieldValue.serverTimestamp(),
                    isClosed: false,
                    closedById: '',
                    lastModified: firebase.fieldValue.serverTimestamp(),
                    createdById: this.selectedTicket.createdById
                }
                const messageData = {
                    senderName: this.userInfo.firstName + " " + this.userInfo.lastName,
                    senderImage: this.userInfo.profileImg,
                    createdAt: firebase.fieldValue.serverTimestamp(),
                    message: 'Hello, thanks for reaching out to us regarding this problem. How can I help?',
                    senderId: userId
                }
                const ticketRef = firebase.firestore.collection('ticket').doc()
                const openTicketRef = firebase.firestore.collection('openTicket').doc(this.selectedTicket.id)
                const messageRef = ticketRef.collection('message').doc()
                const repUserRef = firebase.firestore.collection('user').doc(userId)
                const studentUserRef = firebase.firestore.collection('user').doc(this.selectedTicket.createdById)
                var batch = firebase.firestore.batch()

                batch.set(ticketRef, ticketData)
                batch.delete(openTicketRef)
                batch.set(messageRef, messageData)
                batch.update(repUserRef, {
                    openTickets: firebase.fieldValue.increment(1),
                    totalTickets: firebase.fieldValue.increment(1)
                })
                batch.update(studentUserRef, {
                    openTickets: firebase.fieldValue.increment(-1)
                })

                batch.commit().then(() => {
                    this.loadingDialog = false
                    this.selectedTicket = {}
                    this.snackbar = true
                    this.snackbarText = "Ticket has been accepted."
                })
            },
            cancel(){
                this.selectedTicket = {}
                this.acceptTicketDialog = false
            },
            getDate(firebaseTimestamp){
                return moment(firebaseTimestamp.toDate()).fromNow();
            }
        }
    }
</script>