<template>
  <v-list>
    <v-list-item
      v-for="(link, i) in links"
      :key="i"
      :href="link.link"
      link
      target="_blank"
    >
      <v-list-item-action>
        <v-icon v-text="link.icon"/>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title v-text="link.title" />
        <v-list-item-subtitle v-text="link.subtitle" />
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class LinkList extends Vue {
  links = []
}
</script>
