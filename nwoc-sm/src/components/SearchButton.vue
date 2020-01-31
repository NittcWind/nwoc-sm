<template>
  <v-dialog>
    <template v-slot:activator="{ on }">
      <v-btn
        text
        icon
        v-on="on"
      >
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
    </template>

    <v-card>
      <v-card-text>
        <v-text-field>
        </v-text-field>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class SearchButton extends Vue {}
</script>