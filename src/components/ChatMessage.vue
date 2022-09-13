<template>
    <v-card elevation="2" :color="sender ? 'blue lighten-5' : 'white'">
      <div v-if="sender" class="d-flex flex-row-reverse px-2 py-2">
        <Avatar class="align-center justify-center" :src="photoUrl" />
        <div class="d-flex flex-column ml-2">
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
      <v-card-text :class="sender ? 'text-right' : 'text-left'">
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
    sender: { type: Boolean, default: false }
  },
  computed:{
    getDate(){
      return moment(this.createdAt).fromNow()
    }
  }
}
</script>