<template>
  <v-app>
    <v-app-bar app flat dense>
      <v-btn name="open menu" icon text @click="drawer = !drawer">
        <v-img src="@/assets/logo.color.svg" height="32" contain />
      </v-btn>
      <v-toolbar-title class="pa-0">Score Manager</v-toolbar-title>
      <v-spacer />
      <account-button />
    </v-app-bar>

    <v-main>
      <v-container fluid class="pb-12 mb-4">
        <score-table />
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

const ScoreTable = () => import(/* webpackChunkName: "home" */ '@/components/ScoreTable.vue');
const AccountButton = () => import(/* webpackChunkName: "home" */ '@/components/AccountButton.vue');
const LinkList = () => import(/* webpackChunkName: "home" */ '@/components/LinkList.vue');

@Component({
  components: {
    ScoreTable,
    AccountButton,
    LinkList,
  },
})
export default class App extends Vue {
  drawer = false;
}
</script>
