<template>
    <v-container fluid>
        <v-card>
            <v-toolbar elevation="0">
                <v-toolbar-title>My Tickets</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn v-if="hasSelectedTicket" 
                    color="green darken-4" 
                    dark 
                    @click="closeTicketDialog"
                    class="mr-2">
                    <v-icon class="mr-3">mdi-close</v-icon>
                    <span>Close ticket</span>
                </v-btn>
                <v-btn v-if="userInfo.roleName == 'Student'" 
                    color="blue darken-4" 
                    dark 
                    @click="openTicketDialog">
                    <v-icon class="mr-3">mdi-plus</v-icon>
                    <span>Create ticket</span>
                </v-btn>
            </v-toolbar>
            <v-divider></v-divider>
            <v-row>
                <v-col cols="3">
                    <v-list color="grey lighten-4">
                        <v-list-item-group
                            v-model="selectedTicket"
                            color="primary">
                            <v-list-item
                                v-for="(ticket, i) in tickets"
                                :key="i"
                                @click="ticketSelected(ticket)"
                                class="d-flex flex-direction-row py-2">
                                <v-img
                                    v-if="userInfo.roleName=='Student'"
                                    max-height="48"
                                    max-width="48"
                                    aspect-ratio="1"
                                    class="rounded-circle"
                                    :src="ticket.acceptedByImage">
                                </v-img>
                                <v-img
                                    v-else
                                    max-height="48"
                                    max-width="48"
                                    aspect-ratio="1"
                                    class="rounded-circle"
                                    :src="ticket.authorImage">
                                </v-img>
                                <v-list-item-content>
                                    <v-list-item-title v-if="userInfo.roleName=='Student'" class="text-subtitle-2 ml-3" v-text="ticket.acceptedByName"></v-list-item-title>
                                    <v-list-item-title v-else class="text-subtitle-2 ml-3" v-text="ticket.authorName"></v-list-item-title>

                                    <v-list-item-subtitle class="ml-3"><small>{{convertToDate(ticket.lastModified)}}</small></v-list-item-subtitle>
                                </v-list-item-content>
                            </v-list-item>

                        </v-list-item-group>
                    </v-list>
                </v-col>
                <v-col cols="9">
                    <Message v-if="hasSelectedTicket" :ticketId="selectedTicketId" :currentUserInfo="userInfo"/>
                </v-col>
            </v-row>
        </v-card>
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
                        @change="onDepartmentChange"
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
                Creating ticket...
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
    import Message from '../components/Messages.vue'
    import moment from 'moment'
    const firestore = firebase.firestore
    const auth = firebase.auth
    export default {
        data(){
            return{
                loadingDialog: false,
                hasSelectedTicket: false,
                snackbar: false,
                snackbarTimeout: 2000,
                snackbarText: '',
                selectedTicketId: '',
                selectedTicket: {},
                selectedDepartment: '',
                createTicketDialog: false,
                description: '',
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
                departmentItems: [
                    'College of Engineering and Information Sciences',
                    'College of Agriculture',
                    'College of Arts and Sciences',
                    'College of Teacher Education',
                ],
                courseItems:[],
                courseItemsLibrary:[
                    {
                        department: "College of Engineering and Information Sciences",
                        code: "BIT-CT",
                        name: "Bachelor of Industrial Technology Major in Computer Technology"
                    },
                    {
                        department: "College of Engineering and Information Sciences",
                        code: "BIT-ET",
                        name: "Bachelor of Industrial Technology Major in Electronic Technology"
                    },
                    {
                        department: "College of Engineering and Information Sciences",
                        code: "BIT-HVRAC",
                        name: "Bachelor of Industrial Technology Major in Heating, Ventilating, Refrigerating and Air Conditioning"
                    },
                    {
                        department: "College of Engineering and Information Sciences",
                        code: "BIT-WAFT",
                        name: "Bachelor of Industrial Technology Major in Welding and Fabrication Technology"
                    },
                    {
                        department: "College of Engineering and Information Sciences",
                        code: "BSABE",
                        name: "Bachelor of Science in Agricultural and Biosystems Engineering"
                    },
                    {
                        department: "College of Engineering and Information Sciences",
                        code: "BSAE",
                        name: "Bachelor of Science in Agricultural Engineering"
                    },
                    {
                        department: "College of Engineering and Information Sciences",
                        code: "BSCE",
                        name: "Bachelor of Science in Civil Engineering"
                    },
                    {
                        department: "College of Engineering and Information Sciences",
                        code: "BSECE",
                        name: "Bachelor of Science in AElectronics and Communications Engineering"
                    },
                    {
                        department: "College of Engineering and Information Sciences",
                        code: "BSIS",
                        name: "Bachelor of Science in Information System"
                    },
                    {
                        department: "College of Engineering and Information Sciences",
                        code: "BSIT",
                        name: "Bachelor of Science in Information Technology"
                    },
                    {
                        department: "College of Engineering and Information Sciences",
                        code: "DIFT",
                        name: "Diploma in Inland Fisheries Technology"
                    },
                    {
                        department: "College of Engineering and Information Sciences",
                        code: "MS ABE",
                        name: "Master of Science in Agricultural and Biosystems Engineering"
                    },
                    {
                        department: "College of Agriculture",
                        code: "BAT",
                        name: "Bachelor of Agricultural Technology"
                    },
                    {
                        department: "College of Agriculture",
                        code: "BSA ANSCI",
                        name: "Bachelor of Science in Agriculture Major in Animal Science"
                    },
                    {
                        department: "College of Agriculture",
                        code: "BSA HORT",
                        name: "Bachelor of Science in Agriculture Major in Horticulture"
                    },
                    {
                        department: "College of Agriculture",
                        code: "BSA ARGON",
                        name: "Bachelor of Science in Agriculture Major in Argonomy"
                    },
                    {
                        department: "College of Agriculture",
                        code: "BSAF",
                        name: "Bachelor of Science in Agroforestry"
                    },
                    {
                        department: "College of Agriculture",
                        code: "BS AGRIB",
                        name: "Bachelor of Science in AgriBusiness"
                    },
                    {
                        department: "College of Agriculture",
                        code: "BS ENTREP",
                        name: "Bachelor of Science in Entrepreneurship"
                    },
                    {
                        department: "College of Agriculture",
                        code: "MS AGRON",
                        name: "Master of Science in Agronomy"
                    },
                    {
                        department: "College of Agriculture",
                        code: "MS AN SCI",
                        name: "Master of Science in Animal Science"
                    },
                    {
                        department: "College of Agriculture",
                        code: "MS HORTI",
                        name: "Master of Science in Horticulture"
                    },
                    {
                        department: "College of Arts and Sciences",
                        code: "ABEL",
                        name: "Bachelor of Arts in English Language"
                    },
                    {
                        department: "College of Arts and Sciences",
                        code: "BSAM",
                        name: "Bachelor of Science in Applied Mathematics"
                    },
                    {
                        department: "College of Arts and Sciences",
                        code: "BS BIO",
                        name: "Bachelor of Science in Biology"
                    },
                    {
                        department: "College of Arts and Sciences",
                        code: "BSES",
                        name: "Bachelor of Sceience in Environmental Science"
                    },
                    {
                        department: "College of Teacher Education",
                        code: "BEED",
                        name: "Bachelor of Elementary Education"
                    },
                    {
                        department: "College of Teacher Education",
                        code: "BSED ENGLISH",
                        name: "Bachelor of Secondary Education Major in English"
                    },
                    {
                        department: "College of Teacher Education",
                        code: "BSED MATH",
                        name: "Bachelor of Secondary Education Major in Mathematics"
                    },
                    {
                        department: "College of Teacher Education",
                        code: "BSED SCI",
                        name: "Bachelor of Secondary Education Major in Science"
                    },
                    {
                        department: "College of Teacher Education",
                        code: "BTLED AFA",
                        name: "Bachelor of Technology and Livelihood Education Major in Agri-Fishery Arts"
                    },
                    {
                        department: "College of Teacher Education",
                        code: "BTLED HE",
                        name: "Bachelor of Technology and Livelihood Education Major in Home Economics"
                    },
                    {
                        department: "College of Teacher Education",
                        code: "BTLED IA",
                        name: "Bachelor of Technology and Livelihood Education Major in Industrial Arts"
                    },
                ],
                userList: []
            }
        },
        async mounted(){ 
            document.title = "Tickets - Stakeholders Online Support"
            const userId = auth.currentUser.uid;
            await this.getUserInfo()
            var queryField = "acceptedById"
            if(this.userInfo.roleName == 'Student'){
                queryField = "createdById"
            }
            const ticketCollection = firestore.collection('ticket').where(queryField,"==",userId)
            const query = ticketCollection.orderBy('createdAt', 'desc')
            const unsubscribe = query.onSnapshot(snapshot => {
                const tickets = [];
                snapshot.forEach((doc) => {  
                    tickets.push({
                        id: doc.id,
                        acceptedById: doc.data().acceptedById,
                        acceptedByName: doc.data().acceptedByName,
                        acceptedByImage: doc.data().acceptedByImage,
                        authorImage: doc.data().authorImage,
                        authorName: doc.data().authorName,
                        createdAt: doc.data().createdAt,
                        createdById: doc.data().createdById,
                        isClosed: doc.data().isClosed,
                        lastModified: doc.data().lastModified
                    })
                })
                this.tickets = tickets;
            })
            
            // onUnmounted(unsubscribe)
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
            convertToDate(date){
                return moment(date.toDate()).fromNow()
            },
            createTicket(){
                this.loadingDialog = true
                const userId = firebase.auth.currentUser.uid
                const fullName = this.userInfo.firstName + ' ' + this.userInfo.lastName
                const ticketData = {
                    authorName: fullName,
                    authorImage: this.userInfo.profileImg,
                    createdById: userId,
                    description: this.description,
                    department: this.selectedDepartment,
                    createdAt: firebase.fieldValue.serverTimestamp
                }
                const ticketCollection = firebase.firestore.collection('openTicket');
                ticketCollection.add(ticketData).then((docRef) => {
                    this.createTicketDialog = false
                    this.loadingDialog = false
                    this.snackbarText = "Ticket with id has been created. Please wait until a representative reply to your ticket"
                    this.snackbar = true
                })
            },
            onDepartmentChange(){
                //We can create query 
                const userCollection = firebase.firestore.collection('ticket')
                const query = userCollection.where("department","==",this.selectedDepartment)
            },
            ticketSelected(ticket){
                if(typeof ticket !== 'undefined'){
                    this.selectedTicketId = ticket.id
                    this.hasSelectedTicket = true
                }   
            },
            openTicketDialog(){
                this.createTicketDialog = true
                this.selectedDepartment = this.userInfo.department
            }
        },
        components: {
            Message
        },
    }
</script>