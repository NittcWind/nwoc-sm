<template>
  <v-container fluid class="pa-2">
    <v-row>
      <v-col class="pa-1">
        <v-text-field
          v-model="syncedSearch"
          clearable
          hide-details
          filled
          dense
          single-line
          :prepend-inner-icon="icons.mdiMagnify"
          label="Search"
        />
      </v-col>
      <template v-if="pcView">
        <v-col cols="3" class="pa-1">
          <v-select
            v-model="syncedSortBy"
            dense
            filled
            hide-details
            :items="sortByItems"
            :prepend-inner-icon="icons.mdiSort"
          />
        </v-col>
        <v-col cols="1" class="pa-1">
          <sort-desc-button v-model="syncedSortDesc" />
        </v-col>
      </template>
    </v-row>
    <v-row v-if="!pcView">
      <v-col class="pa-1">
        <v-select
          v-model="syncedSortBy"
          dense
          filled
          hide-details
          :items="sortByItems"
          :prepend-inner-icon="icons.mdiSort"
        />
      </v-col>
      <v-col cols="2" class="pa-1">
        <sort-desc-button v-model="syncedSortDesc" />
      </v-col>
    </v-row>
    <v-progress-linear
      :active="loading"
      :indeterminate="loading"
      absolute
      top
    />

    <new-score-button />
  </v-container>
</template>

<script lang="ts">
import {
  Component, Prop, PropSync, Vue, Watch,
} from 'vue-property-decorator';
import { mdiMagnify, mdiSort } from '@mdi/js';
// import SortDescButton from './SortDescButton.vue';
const SortDescButton = () => import('./SortDescButton.vue');
// import NewScoreButton from './NewScoreButton.vue';
const NewScoreButton = () => import('./NewScoreButton.vue');

@Component({
  components: {
    SortDescButton,
    NewScoreButton,
  },
})
export default class ScoreTableHeader extends Vue {
  @PropSync('search', { required: true, default: '' }) syncedSearch!: string
  @PropSync('sortBy', { required: true, type: String }) syncedSortBy!: string
  @PropSync('sortDesc', { required: true, type: Boolean }) syncedSortDesc!: boolean
  @Prop({ required: true, type: Boolean }) loading!: boolean

  sortByItems = [
    { text: '名称', value: 'name' },
    { text: '別名', value: 'otherName' },
    { text: '保管場所', value: 'address' },
    { text: '年', value: 'year' },
    { text: '出版社', value: 'publisher' },
    { text: 'アーティスト', value: 'singer' },
    { text: '備考', value: 'note' },
  ]

  icons = {
    mdiMagnify,
    mdiSort,
  }

  get pcView(): boolean {
    return !this.$vuetify.breakpoint.smAndDown;
  }

  @Watch('syncedSearch')
  querySetting(): void {
    window.history.replaceState(null, '', `?q=${encodeURIComponent(this.syncedSearch)}`);
  }
}
</script>
