<template>
  <div class="print">
    <header>
      <h1>豊田高専吹奏楽部 楽譜一覧</h1>
    </header>
    <main>
      <printout-button />
      <simple-score-table />
    </main>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

const PrintoutButton = () => import(/* webpackChunkName: "print" */ '@/components/PrintoutButton.vue');
const SimpleScoreTable = () => import(/* webpackChunkName: "print" */ '@/components/SimpleScoreTable.vue');

@Component({
  components: {
    PrintoutButton,
    SimpleScoreTable,
  },
})
export default class Print extends Vue {}
</script>

<style lang="scss" scoped>
.print {
  h1 {
    font-size: 1.5em;
  }

  @media screen {
    padding: 1em;
  }
}
</style>
