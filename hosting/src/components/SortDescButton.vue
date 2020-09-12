<template>
  <v-btn
    icon
    @click="$emit('change', !value)"
  >
    <v-icon v-if="value">
      {{ icons.mdiSortDescending }}
    </v-icon>
    <v-icon v-else>
      {{ icons.mdiSortAscending }}
    </v-icon>
  </v-btn>
</template>

<script lang="ts">
import { Component, Model, Vue } from 'vue-property-decorator';
import { mdiSortDescending, mdiSortAscending } from '@mdi/js';

@Component
export default class SortDescButton extends Vue {
  @Model('change', { required: true }) value!: boolean;

  icons = {
    mdiSortDescending,
    mdiSortAscending,
  }
}
</script>
