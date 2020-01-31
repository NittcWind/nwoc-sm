<template>
  <v-app>
    <!--
    <v-navigation-drawer
      v-model="drawer"
      app
    >
    </v-navigation-drawer>
    -->
    <v-app-bar
      app
    >
      <!-- <v-app-bar-nav-icon @click.stop="drawer = !drawer" /> -->
      <v-btn
        icon
        text
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
      <account-button>
      </account-button>
      <search-button>
      </search-button>
    </v-app-bar>

    <v-content>
      <v-container
        fluid
      >
        <v-select
          label="ソート"
          :items="['曲名', '保管場所', '年', '出版社', '歌手']"
          prepend-icon="mdi-sort-variant"
        >
        </v-select>
        <score-list />
      </v-container>
    </v-content>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import ScoreList from './components/ScoreList.vue'
import AccountButton from './components/AccountButton.vue'
import SearchButton from './components/SearchButton.vue'

@Component({
  components: {
    ScoreList,
    AccountButton,
    SearchButton
  }
})
export default class App extends Vue {
  drawer: boolean = false
}
</script>
