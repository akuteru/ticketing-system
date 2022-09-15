<template>
    <v-container>
        <v-list max-height="420">
            <v-list-item 
                v-for="{ id, createdAt, message, senderImage, senderName, senderId, attachments } in messages"
                class="d-flex"
                :class="isSender(senderId) ? 'justify-end' : 'justify-start'"
                :key="id">
                <Chat :name="senderName"
                    :photo-url="senderImage"
                    :sender="isSender(senderId)"
                    :createdAt="createdAt"
                    :attachments="attachments"
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
            <v-item-group v-if="hasAttachments" class="mb-1 ml-4">
                <v-container>
                    <v-row>
                        <v-col
                            cols="3"
                            v-for="(selectedFile, i) in selectedFiles"
                            :key="i">
                            <v-card 
                                elevation="5"
                                :color="selectedFile.progress < 100 ? 'grey darken-2' : 'blue lighten-1'">
                                <v-card-text>
                                    <span class="text-button font-weight-medium">
                                        <v-icon size="18" class="mr-1">mdi-file</v-icon>
                                        {{selectedFile.name}}
                                    </span>
                                    <v-progress-circular
                                        v-if="selectedFile.progress < 100"
                                        indeterminate
                                        size="24"
                                        color="white"
                                        class="ml-2 float-right"
                                    ></v-progress-circular>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-container>
            </v-item-group>
            <v-text-field
                v-model="sendMessage"
                class="mr-3"
                dense
                append-icon="mdi-send"
                prepend-icon="mdi-upload"
                label="Enter message here"
                :disabled="isTicketClosed"
                :loading="uploading"
                outlined
                clearable
                @keyup.enter.prevent="proceedSendMessage"
                @click:append="proceedSendMessage"
                @click:prepend="onPickFile"
            ></v-text-field>
            <input type="file" multiple style="display: none;" ref="attachmentFiles" accept="*/*" @change="onFilePicked"/>
        </div>
        <v-dialog>
            
        </v-dialog>
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
                        senderName: doc.data().senderName,
                        attachments: doc.data().attachments
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
            hasAttachments(){
                return this.selectedFiles != [] && this.selectedFiles.length > 0
            },
            onPickFile(){
                this.$refs.attachmentFiles.click();
            },
            onFilePicked(event){
                let files = event.target.files
                const fileList = []
                for(var i = 0; i <= files.length - 1; i++){
                    const fileName = files[i].name
                    const ext = fileName.slice(fileName.lastIndexOf('.'))
                    fileList.push({
                        fileData: files[i],
                        name: fileName,
                        ext: ext,
                        progress: 0,
                        downloadUrl: ''
                    })
                }
                this.selectedFiles = fileList
                this.uploadFile()
            },
            async uploadFile(){
                const promiseArray = []
                this.uploading = true
                this.selectedFiles.forEach((file) => {
                    const fileName = Date.now() + '-' + file.name
                    const ext = file.name.slice(file.name.lastIndexOf('.'))
                    const ref = firebase.storage.ref('attachments/' + fileName)
                    var uploadTask = ref.put(file.fileData)
                    promiseArray.push(new Promise((resolve, reject) => {
                        uploadTask.on(firebase.taskEvent.STATE_CHANGED, (snapshot) => {
                                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                                file.progress = progress
                                switch (snapshot.state) {
                                    case firebase.taskState.PAUSED: // or 'paused'
                                        console.log('Upload is paused');
                                        break;
                                    case firebase.taskState.RUNNING: // or 'running'
                                        console.log('Upload is running');
                                        break;
                                }
                            }, 
                            (error) => {
                                console.log(error.code)
                                reject()
                            }, 
                            () => {
                                file.progress = 100
                                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                                    file.downloadUrl = downloadURL
                                    resolve()
                                });
                            }
                        )
                    }))
                })
                Promise.all(promiseArray).then(() => {
                    const attachments = []
                    this.selectedFiles.forEach((file) => {
                        attachments.push({
                            fileName: file.name,
                            downloadUrl: file.downloadUrl,
                            ext: file.ext
                        })
                    })
                    this.attachments = attachments
                    this.uploading = false
                })
            },
            
            isSender(senderId){
                const currentuserId = auth.currentUser.uid
                return senderId == currentuserId
            },
            async proceedSendMessage(){
                if(this.isSending == true) {return}
                this.isSending = true
                if(this.attachments == null || this.attachments.length == 0){
                    if(this.sendMessage == '') {
                        this.isSending = false
                        return
                    }
                }
                const userId = auth.currentUser.uid
                var batch = firestore.batch()
                const ticketRef = firestore.collection('ticket').doc(this.selectedTicketId)
                const messageRef = firestore.collection('ticket').doc(this.selectedTicketId).collection('message').doc()
                const messageData = {
                    senderName: this.currentUserInfo.firstName + " " + this.currentUserInfo.lastName,
                    senderImage: this.currentUserInfo.profileImg,
                    createdAt: firebase.fieldValue.serverTimestamp(),
                    message: this.sendMessage,
                    senderId: userId,
                    attachments: this.attachments
                }
                batch.set(messageRef, messageData)
                batch.update(ticketRef, {lastModified:firebase.fieldValue.serverTimestamp()})
                batch.commit().then(() => {
                    this.attachments = []
                    this.selectedFiles = []
                    this.isSending = false
                    this.sendMessage = ''
                })

            }
        },
        data() {
            return {
                uploading: false,
                messages: [],
                selectedFiles: [],
                attachments: [],
                selectedTicketId: this.ticketId,
                sendMessage: '',
                isSending: false,
            }
        }
    }
</script>
<style scoped>
    .v-list{
        overflow-y: auto;
    }
</style>
