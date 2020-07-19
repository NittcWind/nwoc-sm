<template>
  <v-dialog
    v-model="dialog"
    :max-width="maxWidth"
  >
    <template v-slot:activator="{ on }">
      <v-btn
        name="open account"
        text
        icon
        v-on="on"
        @click="loginCheck"
      >
        <v-icon v-text="icons.mdiAccount" />
      </v-btn>
    </template>

    <v-card
      v-if="!userEmail"
      :max-width="maxWidth"
    >
      <v-form @submit.prevent="login">
        <v-list>
          <v-list-item>
            <v-text-field
              v-model="email"
              type="email"
              label="Email"
              :rules="[required]"
            />
          </v-list-item>
          <v-list-item>
            <v-text-field
              v-model="password"
              :append-icon="showPassword ? icons.mdiEye : icons.mdiEyeOff"
              :type="showPassword ? 'text' : 'password'"
              :rules="[required]"
              label="Password"
              @click:append="showPassword = !showPassword"
            />
          </v-list-item>
        </v-list>
        <v-card-actions>
          <v-spacer />
          <v-btn
            type="submit"
            text
          >
            Log in
          </v-btn>
        </v-card-actions>
        <v-progress-linear
          bottom
          absolute
          :active="loading"
          :indeterminate="loading"
        />
      </v-form>
    </v-card>
    <v-card
      v-else
    >
      <v-card-title>
        {{ userEmail }}
      </v-card-title>
      <v-card-actions>
        <v-spacer />
        <v-btn
          type="submit"
          text
          @click="logout"
        >
          Log out
        </v-btn>
      </v-card-actions>
      <v-progress-linear
        bottom
        absolute
        :active="loading"
        :indeterminate="loading"
      />
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import * as firebase from 'firebase/app'
import 'firebase/auth'
import { mdiAccount, mdiEye, mdiEyeOff } from '@mdi/js'

@Component
export default class AccountButton extends Vue {
  dialog: boolean = false
  email: string = ''
  password: string = ''
  showPassword: boolean = false
  maxWidth = 450
  auth = firebase.auth()
  userEmail = ''
  loading = false

  icons = {
    mdiAccount,
    mdiEye,
    mdiEyeOff
  }

  required(value: string) {
    return !!value || 'Required'
  }

  loginCheck() {
    const currentUser = this.auth.currentUser
    if (currentUser !== null && currentUser.email !== null) this.userEmail = currentUser.email
  }
  
  login() {
    this.loading = true
    this.auth.signInWithEmailAndPassword(this.email, this.password).then(user => {
      this.loading = false
      this.dialog = false
    }).catch(err => {
      this.loading = true
    })
  }

  logout() {
    this.loading = true
    this.auth.signOut().then(() => {
      this.userEmail = ''
      this.loading = false
    })
  }
}
</script>