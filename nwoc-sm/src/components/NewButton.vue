<template>
  <v-dialog
    v-model="dialog"
    :max-width="maxWidth"
  >
    <template v-slot:activator="{ on }">
      <v-btn
        text
        icon
        v-on="on"
        v-if="!!auth.currentUser"
        @click="loginCheck"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </template>

    <edit-card />
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import EditCard from './EditCard.vue'
import * as firebase from 'firebase/app'
import 'firebase/auth'

@Component({
  components: {
    EditCard
  }
})
export default class NewButton extends Vue {
  dialog = false
  maxWidth = 640
  userEmail = ''
  auth = firebase.auth()

  loginCheck() {
    const currentUser = this.auth.currentUser
    if (currentUser !== null && currentUser.email !== null) this.userEmail = currentUser.email
  }
}
</script>