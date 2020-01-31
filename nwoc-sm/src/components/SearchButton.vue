<template>
  <v-dialog
    :max-width="maxWidth"
  >
    <template v-slot:activator="{ on }">
      <v-btn
        text
        icon
        v-on="on"
      >
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
    </template>

    <v-card
      :max-width="maxWidth"
    >
      <v-card-title>
        Search score
      </v-card-title>
      <v-card-text>
        <v-text-field
          class="ma-1"
          append-icon="mdi-magnify"
        >
        </v-text-field>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class SearchButton extends Vue {
  maxWidth = 600
}
</script>