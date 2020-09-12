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
import { Component, Vue } from 'vue-property-decorator';
import { mdiAccount, mdiEye, mdiEyeOff } from '@mdi/js';
import { isRequire } from '@/utils/utils';
import { auth } from '@/utils/firebase';

@Component
export default class AccountButton extends Vue {
  dialog = false
  email = ''
  password = ''
  showPassword = false
  maxWidth = 450
  userEmail = ''
  loading = false
  icons = {
    mdiAccount,
    mdiEye,
    mdiEyeOff,
  }
  required = isRequire

  loginCheck(): void {
    const { currentUser } = auth;
    if (currentUser !== null && currentUser.email !== null) this.userEmail = currentUser.email;
  }

  login(): void {
    this.loading = true;
    auth.signInWithEmailAndPassword(this.email, this.password).then(() => {
      this.loading = false;
      this.dialog = false;
    }).catch(() => {
      this.loading = true;
    });
  }

  logout(): void {
    this.loading = true;
    auth.signOut().then(() => {
      this.userEmail = '';
      this.loading = false;
    });
  }
}
</script>
