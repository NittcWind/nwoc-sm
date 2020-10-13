<template>
  <table>
    <thead>
      <tr>
        <th
          v-for="prop in scoreProps"
          :key="prop.propName"
        >
          {{ prop.text }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="score in scores" :key="score.id">
        <td
          v-for="prop in scoreProps"
          :key="prop.propName"
          :class="{ align: (prop.propName === 'year' || prop.propName === 'address') }"
        >
          <pre v-if="prop.propName === 'note'" v-text="score[prop.propName]" />
          <template v-else>
            {{ score[prop.propName] }}
          </template>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts">
import { Score, ScoreProp } from '@/types';
import { scoreProps } from '@/utils/constants';
import { store } from '@/utils/store';
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class SimpleScoreTable extends Vue {
  // eslint-disable-next-line class-methods-use-this
  get scores(): Score[] {
    return store.scores;
  }

  // eslint-disable-next-line class-methods-use-this
  get scoreProps(): ScoreProp[] {
    return scoreProps;
  }
}
</script>

<style lang="scss" scoped>
thead tr {
  border-bottom: 2px solid #999;
}
tr {
  display: grid;
  grid-template-columns:
    minmax(0, 4fr) minmax(0, 3fr) minmax(0, 1fr) minmax(0, 1fr)
    minmax(0, 2fr) minmax(0, 2fr) minmax(0, 4fr);

  border-bottom: 1px solid #ccc;
  page-break-inside: avoid;

  .align {
    text-align: center;
  }
  pre {
    font-family: inherit;
    overflow: auto;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
}

@media print {
  tr {
    font-size: 0.75em;
  }
}
</style>
