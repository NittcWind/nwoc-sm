<template>
  <v-btn
    dark
    fab
    fixed
    bottom
    right
    @click="printOut"
    class="printout-button"
  >
    <v-icon v-text="icons.mdiPrinter" />
  </v-btn>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mdiPrinter } from '@mdi/js';

@Component({
  components: {},
})
export default class PrintoutButton extends Vue {
  icons = {
    mdiPrinter,
  }

  // eslint-disable-next-line class-methods-use-this
  printOut(): void {
    window.print();
  }
}
</script>

<style lang="scss" scoped>
.printout-button {
  @media print {
    display: none;
  }
}
</style>
