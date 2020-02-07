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
import { Component, Vue } from 'vue-property-decorator'
import { mdiPdfBox, mdiFileExcelBox, mdiJson, mdiGithubBox } from '@mdi/js'

@Component
export default class LinkList extends Vue {
  links = [
    { link: '/pdf', title: '一覧を印刷する', subtitle: 'PDFをダウンロード', icon: mdiPdfBox },
    { link: '/csv', title: 'CSVで一覧を取得する', subtitle: 'Excelで閲覧できる形式', icon: mdiFileExcelBox },
    { link: '/backup', title: 'JSONで一覧を取得する', subtitle: '', icon: mdiJson },
    { link: 'https://github.com/ssssota/nwoc-sm', title: 'Githubリポジトリ', subtitle: 'バグはこちらへ', icon: mdiGithubBox }
  ]
}
</script>