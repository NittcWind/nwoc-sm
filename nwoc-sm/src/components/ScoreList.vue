<template>
  <div
    class="pa-2"
  >
    <v-container
      fluid
    >
      <v-row>
        <v-spacer />
        <v-text-field
          v-model="searchText"
          append-icon="mdi-magnify"
          label="検索"
          single-line
          dense
        />
      </v-row>
    </v-container>
    <v-data-table
      :search="searchText"
      :headers="headers"
      :items="scores"
      :items-per-page="30"
      :sort-by="sortBy"
      :mobile-breakpoint="mobileBreakpoint"
      multi-sort
      dense
      :loading="scores.length <= 0"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import ScoreItem from './ScoreItem.vue'
import * as firebase from 'firebase/app'
import { IScore, IAdresses, IPublishers } from '../types'

@Component({
  components: {
    ScoreItem
  }
})
export default class ScoreList extends Vue {
  publishers: IPublishers = {}
  addresses: IAdresses = {}
  scores: IScore[] = []

  mobileBreakpoint = 800
  searchText = ''
  headers = [
    { text: '正式名', value: 'name'},
    { text: '別名', value: 'otherName'},
    { text: '保管場所', value: 'address'},
    { text: '年', value: 'year'},
    { text: '出版社', value: 'publisher'},
    { text: '歌手', value: 'singer'},
    { text: '備考', value: 'note'}
  ]
  sortBy = ['name', 'publisher']
  width = window.innerWidth

  handleResize() {
    this.width = window.innerWidth
  }
  
  mounted() {
    const db = firebase.firestore()
    db.collection('publishers').get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        this.$set(this.publishers, doc.id, doc.data().name)
      })
    })
    db.collection('addresses').get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        this.$set(this.addresses, doc.id, doc.data().address)
      })
    })
    db.collection('scores').orderBy('name').get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        const data = doc.data()
        const address = this.addresses[data.address.id]
        let year,publisher
        if (address === '課題曲') {
          year = data.year
        } else {
          publisher = this.publishers[data.publishers.id]
        }
        this.scores.push({
          id: doc.id,
          name: data.name as string,
          otherName: data.otherName as string,
          address: address,
          year: year,
          publisher: publisher,
          note: data.note
        })
      })
    })
  }
}
</script>