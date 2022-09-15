<template>
    <v-card elevation="2" :color="sender ? 'blue lighten-5' : 'white'">
      <div v-if="sender" class="d-flex flex-row-reverse px-2 py-2">
        <Avatar class="align-center justify-center" :src="photoUrl" />
        <div class="d-flex flex-column ml-2" :class="sender ? 'text-right mr-2' : 'text-left mr-2'">
          <span class="text-subtitle-1 blue--text text--darken-4">{{name}}</span>
          <span class="text-subtitle-2"><small>{{getDate}}</small></span>
        </div>
      </div>
      <div v-else class="d-flex flex-row px-2 py-2">
        <Avatar class="align-center justify-center" :src="photoUrl" />
        <div class="d-flex flex-column ml-2">
          <span class="text-subtitle-1 blue--text text--darken-4">{{name}}</span>
          <span class="text-subtitle-2"><small>{{getDate}}</small></span>
        </div>
      </div>
      <v-divider></v-divider>
      <v-card-text v-if="hasAttachments()" :class="sender ? 'text-right' : 'text-left'">
          <v-item-group>
            <v-container>
              <v-row>
                <v-col 
                  v-for="(file, i) in attachments"
                  :key="i">
                  <v-card
                    @click="openFile(file.downloadUrl)">
                    <v-img 
                      v-if="isImageFile(file.ext)"
                      :src="file.downloadUrl"
                      width="150"
                      height="150">

                    </v-img>
                    <v-card-text v-else>
                        <span class="text-button">{{file.fileName}}</span>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
          </v-item-group>
          <span>Sent an attachment(s)</span>
      </v-card-text>
      <v-card-text v-else :class="sender ? 'text-right' : 'text-left'">
        <slot />
      </v-card-text>
    </v-card>
</template>

<script>
import Avatar from './Avatar.vue'
import moment from 'moment'
export default {
  components: { Avatar },
  props: {
    name: { type: String, default: '' },
    photoUrl: { type: String, default: '' },
    createdAt: {type: Date},
    sender: { type: Boolean, default: false },
    attachments: { 
      type: Array, 
      default(){
        return []
      }}
  },
  computed:{
    getDate(){
      return moment(this.createdAt).fromNow()
    }
  },
  methods:{
    isImageFile(extension){
      return extension.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    },
    hasAttachments(){
      return this.attachments != null && this.attachments.length > 0
    },
    openFile(url){
      window.open(url)
    }
  }
}
</script>