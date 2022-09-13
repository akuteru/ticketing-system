<template>
    <v-container>
        <v-list max-height="420">
            <v-list-item 
                v-for="{ id, createdAt, message, senderImage, senderName, senderId } in messages"
                class="d-flex"
                :class="isSender(senderId) ? 'justify-end' : 'justify-start'"
                :key="id">
                <Chat :name="senderName"
                    :photo-url="senderImage"
                    :sender="isSender(senderId)"
                    :createdAt="createdAt"
                    class="mt-3 mr-4"
                >
                    {{ message }}
                </Chat>
            </v-list-item>
            <div ref="bottom" class="mt-2"></div>
        </v-list>
        <!-- <v-row class="d-flex flex-column flex-column-reverse">
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
        </v-row> -->
        <div style="margin-top: 30px" class="ml-n3 mr-1">
            <v-text-field
                v-model="sendMessage"
                dense
                append-icon="mdi-send"
                label="Enter message here"
                :disabled="isTicketClosed"
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
    import { onUnmounted, watch } from 'vue'
    const firestore = firebase.firestore
    const auth = firebase.auth
    export default {
        components: {
            Chat
        },
        props: { 
            ticketId: {
                type: String,
                required: true,
                default: ''
            },
            currentUserInfo :{
                type: Object
            },
            isTicketClosed: {
                type: Boolean,
                default: false
            }
        },
        mounted(){
            const messageCollection = firestore.collection('ticket').doc(this.selectedTicketId).collection('message')
            const query = messageCollection.orderBy('createdAt', 'desc').limit(30)
            let messages = [];
            const unsubscribe = query.onSnapshot(snapshot => {
                messages = [];
                snapshot.forEach((doc) => {
                    messages.unshift({
                        id: doc.id,
                        createdAt: doc.data().createdAt.toDate(),
                        message: doc.data().message,
                        senderId: doc.data().senderId,
                        senderImage: doc.data().senderImage,
                        senderName: doc.data().senderName
                    })
                })
                this.messages = messages;
            })
            const bottom = this.$refs.bottom
            this.$watch(
                'messages',
                () => {
                    bottom.scrollIntoView({behavior:'smooth'})
                },
                {deep: true}
            )
            onUnmounted(unsubscribe)
        },
        methods: {
            isSender(senderId){
                const currentuserId = auth.currentUser.uid
                return senderId == currentuserId
            },
            proceedSendMessage(){
                if(this.sendMessage === '') {return}
                const userId = auth.currentUser.uid
                var batch = firestore.batch()
                const ticketRef = firestore.collection('ticket').doc(this.selectedTicketId)
                const messageRef = firestore.collection('ticket').doc(this.selectedTicketId).collection('message').doc()
                const messageData = {
                    senderName: this.currentUserInfo.firstName + " " + this.currentUserInfo.lastName,
                    senderImage: this.currentUserInfo.profileImg,
                    createdAt: firebase.fieldValue.serverTimestamp(),
                    message: this.sendMessage,
                    senderId: userId
                }
                batch.set(messageRef, messageData)
                batch.update(ticketRef, {lastModified:firebase.fieldValue.serverTimestamp()})
                batch.commit().then(() => {
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
<style scoped>
    .v-list{
        overflow-y: auto;
    }
</style>
