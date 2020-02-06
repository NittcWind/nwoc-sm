<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      app
      bottom
    >
      <v-list>
        <v-list-item
          v-for="(link, i) in links"
          :key="i"
          :href="link.link"
          link
        >
          <v-list-item-action>
            <v-icon v-text="link.icon"/>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="link.title" />
            <v-list-item-subtitle v-text="link.subtitle" />
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

  links = [
    { link: '/pdf', title: '一覧を印刷する', subtitle: 'PDFをダウンロード', icon: 'mdi-pdf-box' },
    { link: '/csv', title: 'CSVで一覧を取得する', subtitle: 'Excelで閲覧できる形式', icon: 'mdi-file-excel-box' },
    { link: '/buckup', title: 'JSONで一覧を取得する', subtitle: '', icon: 'mdi-json' }
  ]
}
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Noto+Sans+JP|Roboto&display=swap');
.v-application *:not(.v-icon) {
  font-family: 'Roboto', 'Noto Sans JP', sans-serif;
}
</style>