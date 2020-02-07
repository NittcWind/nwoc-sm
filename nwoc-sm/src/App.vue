<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      app
      bottom
    >
      <link-list />
    </v-navigation-drawer>
    <v-app-bar
      app
    >
      <v-btn
        name="open menu"
        icon
        text
        @click="drawer = !drawer"
      >
        <v-img
          src="./assets/logo.color.svg"
          height="32"
          contain
        />
      </v-btn>
      <v-toolbar-title
        class="pa-0"
      >
        Score Manager
      </v-toolbar-title>
      <v-spacer>
      </v-spacer>
      <account-button />
    </v-app-bar>

    <v-content>
      <v-container
        fluid
      >
        <score-list />
      </v-container>
    </v-content>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
//import ScoreList from './components/ScoreList.vue'
const ScoreList = () => import('./components/ScoreList.vue')
//import AccountButton from './components/AccountButton.vue'
const AccountButton = () => import('./components/AccountButton.vue')
//import LinkList from './components/LinkList.vue'
const LinkList = () => import('./components/LinkList.vue')

@Component({
  components: {
    ScoreList,
    AccountButton,
    LinkList
  }
})
export default class App extends Vue {
  drawer: boolean = false
}
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Noto+Sans+JP|Roboto&display=swap');
.v-application *:not(.v-icon) {
  font-family: 'Roboto', 'Noto Sans JP', sans-serif;
}
</style>