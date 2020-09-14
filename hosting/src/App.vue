<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      fixed
      temporary
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

    <v-main>
      <v-container
        fluid
        class="pb-12 mb-4"
      >
        <score-table />
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
// import ScoreTable from './components/ScoreTable.vue'
const ScoreTable = () => import('./components/ScoreTable.vue');
// import AccountButton from './components/AccountButton.vue'
const AccountButton = () => import('./components/AccountButton.vue');
// import LinkList from './components/LinkList.vue'
const LinkList = () => import('./components/LinkList.vue');

@Component({
  components: {
    ScoreTable,
    AccountButton,
    LinkList,
  },
})
export default class App extends Vue {
  drawer = false
}
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Noto+Sans+JP|Roboto&display=swap');
.v-application *:not(.v-icon) {
  font-family: 'Roboto', 'Noto Sans JP', sans-serif;
}
</style>
