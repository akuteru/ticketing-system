<template>
    <v-container fluid>
        <v-card>
            <v-toolbar elevation="0">
                <v-toolbar-title>
                    <span class="text-h6">{{userInfo.department}}</span>
                    <small class="ml-2">(Open tickets for this department)</small>
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
                            color="blue darken-4"
                            dark
                        >
                            <div class="d-flex flex-no-wrap justify-space-between">
                            <div>
                                <v-card-title
                                    class="text-h6"
                                    v-text="ticket.authorName"
                                ></v-card-title>

                                <v-card-subtitle class="text-subtitle-2" v-text="ticket.description"></v-card-subtitle>

                                <v-card-actions>
                                <v-btn
                                    class="mt-3 ml-2 mb-2"
                                    right
                                    light
                                    @click="onAcceptTicketDialog(ticket)"
                                >
                                    Accept
                                </v-btn>
                                </v-card-actions>
                            </div>

                            <v-avatar
                                class="ma-3"
                                size="125"
                                tile
                            >
                                <v-img :src="ticket.authorImage"></v-img>
                            </v-avatar>
                            </div>
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
                <v-card-title class="text-h5 grey lighten-2">
                    Accept this ticket?
                </v-card-title>
                <v-card-text class="py-5">
                    <span class="text-h6">{{selectedTicket.authorName}}</span>
                    <br>
                    <span class="text-subtitle-1">{{selectedTicket.description}}</span>
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions>
                <v-btn
                    color="primary"
                    text
                    @click="cancel"
                >
                    Cancel
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn
                    color="primary"
                    text
                    @click="proceedAccept"
                >
                    Proceed
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
                Accepting ticket...
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
    const firestore = firebase.firestore
    const auth = firebase.auth
    export default {
        data(){
            return{
                loadingDialog: false,
                snackbar: false,
                snackbarTimeout: 2000,
                snackbarText: '',
                selectedOpenTicketId: '',
                selectedDepartment: '',
                acceptTicketDialog: false,
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
            }
        },
        async mounted(){ 
            document.title = "Open Tickets - Stakeholders Online Support"
            await this.getUserInfo()
            console.log(this.userInfo.department)
            const ticketCollection = firestore.collection('openTicket').where("department","==",this.userInfo.department)
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
            createTicket(){
                this.createTicketDialog = false
            },
            ticketSelected(ticketId){
                if(typeof ticketId !== 'undefined'){
                    this.selectedTicketId = ticketId
                }   
            },
            onAcceptTicketDialog(ticket){
                this.selectedTicket = ticket
                this.acceptTicketDialog = true
                console.log(this.selectedTicket)
            },
            proceedAccept(){
                this.acceptTicketDialog = false
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
                var batch = firebase.firestore.batch()

                batch.set(ticketRef, ticketData)
                batch.delete(openTicketRef)
                batch.set(messageRef, messageData)

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
            }
        }
    }
</script>