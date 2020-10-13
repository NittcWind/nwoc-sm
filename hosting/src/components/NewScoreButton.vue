<template>
  <v-btn
    fixed
    fab
    bottom
    right
    color="orange"
    @click="createNew()"
  >
    <v-icon>{{ icons.mdiPlus }}</v-icon>
    <edit-dialog
      :item="editItem"
      :open="editing"
      @close="editing = false"
    />
  </v-btn>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mdiPlus } from '@mdi/js';
import { Score } from '@/types';
import { generateBlankScore } from '@/utils/utils';
// import EditDialog from './EditDialog.vue';
const EditDialog = () => import('./EditDialog.vue');

@Component({
  components: {
    EditDialog,
  },
})
export default class NewScoreButton extends Vue {
  editing = false

  editItem: Score = generateBlankScore()

  createNew(): void {
    this.editItem = generateBlankScore();
    this.editing = true;
  }

  icons = {
    mdiPlus,
  }
}
</script>
