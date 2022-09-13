<template>
    <v-container>
        <v-row class="d-flex flex-column flex-column-reverse">
            <Chat v-for="{ id, createdAt, message, senderImage, senderName, senderId } in messages"
                :key="id"
                :name="senderName"
                :photo-url="senderImage"
                :sender="senderId == currentUser?.uid"
                :createdAt="createdAt.toDate()"
                class="mt-3 mr-4 "
            >
                {{ message }}
            </Chat>
        </v-row>
        <div style="margin-top: 30px" class="ml-n3 mr-1">
            <v-text-field
                v-model="sendMessage"
                dense
                append-icon="mdi-send"
                label="Enter message here"
                outlined
                clearable
                @keyup.enter.prevent="proceedSendMessage"
                @click:append="proceedSendMessage"
            ></v-text-field>
        </div>
    </v-container>
</template>
<script>
    import firebase from '../firebase/index'
    import Chat from './ChatMessage.vue'
    import { onUnmounted } from 'vue'
    const firestore = firebase.firestore
    const auth = firebase.auth
    export default {
        components: {
            Chat
        },
        computed: {
            currentUser(){
                return auth.currentUser.uid
            }
        },
        props: { 
            ticketId: {
                type: String,
                required: true,
                default: ''
            },
            currentUserInfo :{
                type: Object
            }
        },
        mounted(){
            const messageCollection = firestore.collection('ticket').doc(this.selectedTicketId).collection('message')
            const query = messageCollection.orderBy('createdAt', 'desc').limit(50)
            const unsubscribe = query.onSnapshot(snapshot => {
                const messages = [];
                snapshot.forEach((doc) => {
                    messages.push(doc.data())
                })
                this.messages = messages;
            })
            onUnmounted(unsubscribe)
        },
        methods: {
            proceedSendMessage(){
                const userId = auth.currentUser.uid
                const messageCollection = firestore.collection('ticket').doc(this.selectedTicketId).collection('message').doc()
                const messageData = {
                    senderName: this.currentUserInfo.firstName + " " + this.currentUserInfo.lastName,
                    senderImage: this.currentUserInfo.profileImg,
                    createdAt: firebase.fieldValue.serverTimestamp(),
                    message: this.sendMessage,
                    senderId: userId
                }
                messageCollection.set(messageData).then(() => {
                    this.sendMessage = ''
                })

            }
        },
        data() {
            return {
                messages: [],
                selectedTicketId: this.ticketId,
                sendMessage: '',
            }
        }
    }
</script>
