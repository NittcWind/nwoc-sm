<template>
  <v-card>
    <v-card-title>
      <v-text-field
        label="正式名"
      >
      </v-text-field>
    </v-card-title>
    <v-card-text>
      <v-text-field
        label="別名"
      >
      </v-text-field>
      <v-select
        label="保管場所"
        :items="addresses"
        item-text="name"
        item-value="id"
      >
      </v-select>
      <v-select
        label="出版社"
        :items="publishers"
        item-text="name"
        item-value="id"
      >
      </v-select>
      <v-text-field
        label="年"
      >
      </v-text-field>
      <v-text-field
        label="歌手"
      >
      </v-text-field>
      <v-textarea
        label="備考"
      >
      </v-textarea>
    </v-card-text>
    <v-card-actions>
      <v-btn
        text
      >
        Cancel
      </v-btn>
      <v-spacer />
      <v-btn
        text
        color="primary"
      >
        OK
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { IScore, IAdresses, IPublishers } from '../types'
import * as firebase from 'firebase/app'

@Component
export default class EditCard extends Vue {
  @Prop() score!: IScore
  addresses: IAdresses[] = []
  publishers: IPublishers[] = []

  mounted() {
    const db = firebase.firestore()
    db.collection('publishers').get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        this.publishers.push({
          id: doc.id,
          name: doc.data().name
        })
      })
    })
    db.collection('addresses').get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        this.addresses.push({
          id: doc.id,
          name: doc.data().address
        })
      })
    })
  }
}
</script>