<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      app
      bottom
    >
      <v-list two-line>
        <v-list-item href="/pdf">
          <v-list-item-content>
            <v-list-item-title>
              一覧を印刷する
            </v-list-item-title>
            <v-list-item-subtitle>
              PDFをダウンロード
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-list-item href="/csv">
          <v-list-item-content>
            <v-list-item-title>
              CSVで一覧を取得する
            </v-list-item-title>
            <v-list-item-subtitle>
              Excelで閲覧できる形式
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-list-item href="/backup">
          <v-list-item-content>
            <v-list-item-title>
              JSONで一覧を取得する
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      app
    >
      <v-btn
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
import ScoreList from './components/ScoreList.vue'
import AccountButton from './components/AccountButton.vue'

@Component({
  components: {
    ScoreList,
    AccountButton
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