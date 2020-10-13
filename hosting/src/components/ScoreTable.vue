<template>
  <v-data-iterator
    :items="scores"
    :items-per-page="itemsPerPage"
    :page="page"
    :search="search"
    :sort-by="sortBy"
    :sort-desc="sortDesc"
    :footer-props="footerProps"
  >
    <template v-slot:header>
      <score-table-header
        :loading="loading"
        :search.sync="search"
        :sort-by.sync="sortBy"
        :sort-desc.sync="sortDesc"
      />
    </template>

    <template v-slot:default="{ items }">
      <score-table-main
        :scores="items"
      />
    </template>
  </v-data-iterator>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { scores } from '@/utils/database';
import { Score } from '@/types';
import { getUrlParam } from '@/utils/utils';
// import ScoreTableHeader from './ScoreTableHeader.vue';
const ScoreTableHeader = () => import('./ScoreTableHeader.vue');
// import ScoreTableMain from './ScoreTableMain.vue';
const ScoreTableMain = () => import('./ScoreTableMain.vue');

@Component({
  components: {
    ScoreTableHeader,
    ScoreTableMain,
  },
})
export default class ScoreTable extends Vue {
  scores: Score[] = []
  loading = true
  search = getUrlParam('q') || ''
  sortBy = 'address'
  sortDesc = false
  itemsPerPage = 30
  page = 0

  footerProps = {
    'items-per-page-options': [10, 30, 100, -1],
    'show-first-last-page': true,
    'show-current-page': true,
  }

  async mounted(): Promise<void> {
    this.scores = await scores;
    this.loading = false;
  }
}
</script>
