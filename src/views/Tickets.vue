<template>
    <v-container fluid>
        <v-card>
            <v-toolbar elevation="0">
                <v-toolbar-title>My Tickets</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn v-if="hasSelectedTicket" 
                    color="red darken-4" 
                    dark 
                    small
                    @click="openCloseTicketDialog"
                    class="mr-2">
                    <v-icon class="mr-2">mdi-close</v-icon>
                    <span>Close ticket</span>
                </v-btn>
                <v-btn v-if="userInfo.roleName == 'Student'" 
                    color="blue darken-4"
                    small 
                    dark 
                    @click="openTicketDialog">
                    <v-icon class="mr-2">mdi-plus</v-icon>
                    <span>Create ticket</span>
                </v-btn>
            </v-toolbar>
            <v-divider></v-divider>
            <v-row>
                <v-col md="3" sm="4" xs="12">
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
                <v-col md="9" sm="8" xs="12">
                    <Message v-if="hasSelectedTicket" 
                        :key="messageKey" 
                        :ticketId="selectedTicketId" 
                        :currentUserInfo="userInfo" 
                        :isTicketClosed="clickedTicket.isClosed"/>
                    <div v-else class="text-center py-10 d-flex flex-column">
                        <lottie :options="animationOptions" :height="300" :width="300" class="mx-auto"/>
                        <span class="text-h5 grey--text text--darken-1">Select a message</span>
                        <span class="text-subtitle grey--text text--lighten-1">You can choose from the list of messages from the left to display its content.</span>
                    </div>
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
            v-model="closeTicketDialog"
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
                        color="yellow"
                        v-model="feedback.item1"
                    ></v-rating>
                    <span>2. How satisfied were you with the outcome of the service provided?</span>
                    <v-rating
                        empty-icon="mdi-star-outline"
                        full-icon="mdi-star"
                        half-icon="mdi-star-half-full"
                        hover
                        length="5"
                        size="32"
                        color="yellow"
                        v-model="feedback.item2"
                    ></v-rating>
                    <span>3. How satisfied were you with the service provider's extensive information /understanding of the service being provided?</span>
                    <v-rating
                        empty-icon="mdi-star-outline"
                        full-icon="mdi-star"
                        half-icon="mdi-star-half-full"
                        hover
                        length="5"
                        size="32"
                        color="yellow"
                        v-model="feedback.item3"
                    ></v-rating>
                    <span>4. How satisfied were you with the service provider's competence or the skill in delivering service?</span>
                    <v-rating
                        empty-icon="mdi-star-outline"
                        full-icon="mdi-star"
                        half-icon="mdi-star-half-full"
                        hover
                        length="5"
                        size="32"
                        color="yellow"
                        v-model="feedback.item4"
                    ></v-rating>
                    <span>5. How satisfied were you with the service provider's friendliness, courteousness/politeness, fair treatment and willingness to do more then what is expected or going to extra mile?</span>
                    <v-rating
                        empty-icon="mdi-star-outline"
                        full-icon="mdi-star"
                        half-icon="mdi-star-half-full"
                        hover
                        length="5"
                        size="32"
                        color="yellow"
                        v-model="feedback.item5"
                    ></v-rating>
                    <span>6. How would you rate our <strong>OVERALL SATISFACTION</strong> with regard to the quality of service delivery?</span>
                    <v-rating
                        empty-icon="mdi-star-outline"
                        full-icon="mdi-star"
                        half-icon="mdi-star-half-full"
                        hover
                        length="5"
                        size="32"
                        color="yellow"
                        v-model="feedback.item6"
                    ></v-rating>
                    <v-combobox
                        filled
                        class="mt-4"
                        outlined
                        label="Inquiry Type"
                        v-model="feedback.providedDetails"
                        :items="feedbackItems"
                    ></v-combobox>
                    <v-textarea
                        outlined
                        label="Facts or details about the indcident"
                        v-model="feedback.incidentDetails"
                    >
                    </v-textarea>
                    <v-textarea
                        outlined
                        label="Recommendation/Suggestion/Desired Action from the Office"
                        v-model="feedback.recommendation"
                    >
                    </v-textarea>
                    <v-expansion-panels>
                        <v-expansion-panel>
                            <v-expansion-panel-header>
                                Data Privacy
                            </v-expansion-panel-header>
                            <v-expansion-panel-content>
                                The Agusan del Sur State College of Agriculture and Technology (ASSCAT) is committed to protect your personal data (if given) and recognize our responsibilities under Republic Act No. 10173, also known as Data Privacy Act of 2012.
                            </v-expansion-panel-content>
                        </v-expansion-panel>
                    </v-expansion-panels>
                    <v-checkbox v-model="feedback.termsAgree">
                        <template v-slot:label>
                            <div class="text-caption">
                                I have read and understand the ASSCAT's Data Privacy Statement and express my consent for ASSCAT to collect, store, use, and share, process my Feedback on their service/s.
                            </div>
                        </template>
                    </v-checkbox>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="blue darken-4"
                        text
                        @click="closeTicketDialog = false"
                    >
                        Close
                    </v-btn>
                    <v-btn
                        color="blue darken-4"
                        text
                        @click="proceedCloseTicket"
                        :disabled="feedback.termsAgree == false"
                    >
                        Send Feedback
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

    import Lottie from '../components/Lottie.vue'
    import messageAnimationData from '../assets/lotties/messages.json'
    import { onUnmounted } from 'vue'
    import firebase from '../firebase/index'
    import Message from '../components/Messages.vue'
    import moment from 'moment'
    const firestore = firebase.firestore
    const auth = firebase.auth
    export default {
        data(){
            return{
                animationSpeed: 1,
                animationOptions: {animationData: messageAnimationData},
                feedback:{
                    ticketId:'',
                    userId: '',
                    userFullName:'',
                    userPhoto: '',
                    repId: '',
                    repFullName:'',
                    repPhoto:'',
                    item1:0,
                    item2:0,
                    item3:0,
                    item4:0,
                    item5:0,
                    item6:0,
                    providedDetails: '',
                    incidentDetails: '',
                    recommendation: '',
                    termsAgree: false,
                    createdAt: firebase.fieldValue.serverTimestamp()
                },
                feedbackItems:[
                    "Compliment",
                    "Suggestion",
                    "Complaint"
                ],
                messageKey: 'message-',
                loadingText: 'Creating ticket...',
                loadingDialog: false,
                hasSelectedTicket: false,
                snackbar: false,
                snackbarTimeout: 2000,
                snackbarText: '',
                selectedTicketId: '',
                selectedTicket: '',
                clickedTicket: {},
                selectedDepartment: '',
                createTicketDialog: false,
                closeTicketDialog: false,
                description: '',
                tickets: [],
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
            const query = ticketCollection.orderBy('lastModified', 'desc').limit(20)
            const unsubscribe = query.onSnapshot(snapshot => {
                const tickets = [];
                snapshot.forEach((doc) => {  
                    tickets.unshift({
                        id: doc.id,
                        acceptedById: doc.data().acceptedById,
                        acceptedByName: doc.data().acceptedByName,
                        acceptedByImage: doc.data().acceptedByImage,
                        authorImage: doc.data().authorImage,
                        authorName: doc.data().authorName,
                        createdAt: doc.data().createdAt,
                        createdById: doc.data().createdById,
                        isClosed: doc.data().isClosed,
                        closedById: doc.data().closedById,
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
            onDepartmentChange(){
                //We can create query 
                const userCollection = firebase.firestore.collection('ticket')
                const query = userCollection.where("department","==",this.selectedDepartment)
            },
            ticketSelected(ticket){
                if(typeof ticket !== 'undefined'){
                    const userId = auth.currentUser.uid

                    this.messageKey = ticket.id
                    this.selectedTicketId = ticket.id
                    this.clickedTicket = ticket
                    this.hasSelectedTicket = true

                    this.feedback.ticketId = this.clickedTicket.id
                    this.feedback.userId = this.clickedTicket.createdById
                    this.feedback.userFullName = this.clickedTicket.authorName
                    this.feedback.userPhoto = this.clickedTicket.authorImage
                    this.feedback.repId = userId
                    this.feedback.repFullName = this.userInfo.firstName + ' ' + this.userInfo.lastName
                    this.feedback.repPhoto = this.userInfo.profileImg
                }   
            },
            openCloseTicketDialog(){
                this.closeTicketDialog = true
            },
            openTicketDialog(){
                this.createTicketDialog = true
                this.selectedDepartment = this.userInfo.department
            },
            proceedCloseTicket(){
                this.closeTicketDialog = false
                this.loadingText = 'Closing ticket...'
                this.loadingDialog = true
                const userId = auth.currentUser.uid

                const feedbackRef = firestore.collection('feedback').doc()
                const repUserRef = firestore.collection('user').doc(this.clickedTicket.acceptedById)
                const userRef = firestore.collection('user').doc(this.clickedTicket.createdById)
                const ticketRef = firestore.collection('ticket').doc(this.clickedTicket.id)
                var batch = firestore.batch()
                batch.set(feedbackRef, this.feedback)
                batch.update(repUserRef,{
                    openTickets: firebase.fieldValue.increment(-1),
                    closedTickets: firebase.fieldValue.increment(1)
                })
                batch.update(userRef,{
                    closedTickets: firebase.fieldValue.increment(1)
                })
                batch.update(ticketRef,{
                    isClosed: true,
                    closedById: userId
                })
                batch.commit().then(() => {
                    this.loadingDialog = false
                    this.snackbarText = 'Ticket has been closed'
                    this.snackbar = true
                    this.feedback = {
                        ticketId:'',
                        userId: '',
                        userFullName:'',
                        userPhoto: '',
                        repId: '',
                        repFullName:'',
                        repPhoto:'',
                        item1:0,
                        item2:0,
                        item3:0,
                        item4:0,
                        item5:0,
                        item6:0,
                        providedDetails: '',
                        incidentDetails: '',
                        recommendation: '',
                        termsAgree: false,
                        createdAt: firebase.fieldValue.serverTimestamp()
                    }
                    this.messageKey = 'message-'
                    this.selectedTicketId = ''
                    this.clickedTicket = {}
                    this.hasSelectedTicket = false
                    
                })
            }
        },
        components: {
            Message,
            'lottie': Lottie
        },
    }
</script>