<template>
  <v-btn icon @click="$router.push({ name: 'Print' })">
    <v-icon v-text="icons.mdiPdfBox" />
  </v-btn>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mdiPdfBox } from '@mdi/js';

@Component({
  components: {},
})
export default class PrintButton extends Vue {
  icons = {
    mdiPdfBox,
  }
}
</script>
