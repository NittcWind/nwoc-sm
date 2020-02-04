<template>
  <div
    class="pa-2"
  >
    <v-data-table
      :search="searchText"
      :headers="headers"
      :items="scores"
      :items-per-page="itemsPerPage"
      :sort-by="sortBy"
      :mobile-breakpoint="mobileBreakpoint"
      multi-sort
      dense
      :loading="scores.length <= 0"
      :footer-props="{
        disableItemsPerPage: true,
        itemsPerPageOptions: [minItemsPerPage,maxItemsPerPage]
      }"
    >
      <template v-slot:top>
        <v-toolbar
          flat
          dense
        >
          <v-dialog v-model="delForm.dialog" persistent :max-width="maxWidth">
            <v-card>
              <v-card-title>
                この楽譜を削除しますか？
              </v-card-title>
              <v-card-text>
                <v-alert dense type="warning">
                  削除を行うと元には戻せません。
                </v-alert>
                <p>正式名を入力して削除を確定してください。</p>
                <v-text-field :placeholder="delForm.score.name" v-model="delForm.name" />
              </v-card-text>
              <v-card-actions>
                <v-btn text @click="delForm.close()">
                  Cancel
                </v-btn>
                <v-spacer />
                <v-btn
                  :disabled="delForm.score.name != delForm.name"
                  class="white--text"
                  color="red"
                  depressed
                  @click="delForm.delete()"
                >
                  OK
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="dialog" persistent :max-width="maxWidth">
            <template v-slot:activator="{ on }">
              <v-btn
                class="mb-2"
                color="primary"
                v-on="on"
              >
                New
              </v-btn>
            </template>
            <v-card>
              <v-progress-linear
                top
                absolute
                :active="loading"
                :indeterminate="loading"
              />
              <v-card-title>
                <v-text-field
                  required
                  label="正式名"
                  v-model="editItem.name"
                />
              </v-card-title>
              <v-card-text>
                <v-text-field
                  label="別名"
                  v-model="editItem.otherName"
                />
                <v-select
                  required
                  label="保管場所"
                  :items="addresses"
                  item-text="name"
                  item-value="id"
                  v-model="editItem.address"
                />
                <v-select
                  v-if="!isKadaikyoku"
                  label="出版社"
                  :items="publishers"
                  item-text="name"
                  item-value="id"
                  v-model="editItem.publisher"
                />
                <v-text-field
                  v-if="isKadaikyoku"
                  type="number"
                  label="年"
                  min="1940" max="2200"
                  v-model="editItem.year"
                />
                <v-text-field
                v-if="!isKadaikyoku"
                  label="歌手"
                  v-model="editItem.singer"
                />
                <v-textarea
                  label="備考"
                  v-model="editItem.note"
                />
                <v-alert
                  v-if="!!errMsg"
                  dense
                  outlined
                  type="error"
                >
                  {{ errMsg }}
                </v-alert>
              </v-card-text>
              <v-card-actions>
                <v-btn
                  text
                  @click="close"
                >
                  Cancel
                </v-btn>
                <v-spacer />
                <v-btn
                  text
                  color="primary"
                  @click="save"
                >
                  OK
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-spacer />
          <v-text-field
            v-model="searchText"
            append-icon="mdi-magnify"
            label="検索"
            single-line
            dense
          />
        </v-toolbar>
      </template>
      <template v-slot:item.action="{ item }">
        <v-icon
          small
          class="mr-2"
          @click="editScore(item)"
        >
          mdi-pencil
        </v-icon>
        <v-icon
          small
          @click="delForm.open(item)"
        >
          mdi-delete
        </v-icon>
      </template>
      <template v-slot:no-data>NO DATA</template>
    </v-data-table>
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
  publishers: IPublishers[] = []
  addresses: IAdresses[] = []
  scores: IScore[] = []

  id2name(arr: IPublishers[] | IAdresses[], id: string = ''): string {
    const target = arr.find(val => val.id === id)
    return (target && target.name) || ''
  }
  name2id(arr: IPublishers[] | IAdresses[], name: string = ''): string {
    const target = arr.find(val => val.name === name)
    return (target && target.id) || ''
  }

  // edit dialog variables(constants)
  loading = false
  maxWidth = 640
  dialog = false
  editTargetId = ''
  editItem = {
    name: '',
    otherName: '',
    address: '',
    publisher: '',
    year: (new Date()).getFullYear(),
    singer: '',
    note: ''
  }
  defaultItem = {
    name: '',
    otherName: '',
    address: '',
    publisher: '',
    year: (new Date()).getFullYear(),
    singer: '',
    note: ''
  }
  errMsg = ''
  kadaikyokuAddress = ''
  db = firebase.firestore()
  get isKadaikyoku() {
    return this.kadaikyokuAddress === this.editItem.address
  }

  dummyScore = { name: 'xxx', id: '' }
  // delete form
  delForm = {
    self: this as ScoreList,
    dialog: false,
    dummy: this.dummyScore,
    score: this.dummyScore,
    name: '',
    open(score: IScore) {
      this.dialog = true
      this.score = score
    },
    close() {
      this.dialog = false
      this.name = ''
      setTimeout(() => this.score = this.dummy, 100)
    },
    delete() {
      if (this.score === this.dummy) return
      const db = this.self.db as firebase.firestore.Firestore
      db.collection('scores').doc(this.score.id).delete().then(() => {
        const scores = this.self.scores as IScore[]
        scores.splice(scores.findIndex(val => val.id === this.score.id), 1)
        this.close()
      }).catch(() => {

      })
    }
  }

  // table valiables(constants)
  mobileBreakpoint = 640
  minItemsPerPage = 10
  maxItemsPerPage = 50
  searchText = ''
  headers = [
    { text: '正式名', value: 'name'},
    { text: '別名', value: 'otherName'},
    { text: '保管場所', value: 'address'},
    { text: '年', value: 'year'},
    { text: '出版社', value: 'publisher'},
    { text: '歌手', value: 'singer'},
    { text: '備考', value: 'note'},
    { text: 'Actions', value: 'action', sortable: false }
  ]
  sortBy = ['name', 'publisher']
  width = window.innerWidth
  get itemsPerPage() {
    return (this.width < this.mobileBreakpoint)? this.minItemsPerPage: this.maxItemsPerPage
  }

  handleResize() {
    this.width = window.innerWidth
  }
  
  async mounted() {
    // 表示数変更のためのリサイズイベント
    window.addEventListener('resize', this.handleResize)

    // 保管場所と出版社は参照
    this.db.collection('publishers').orderBy('name').get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        this.publishers.push({
          id: doc.id,
          name: doc.data().name
        })
      })
    })
    this.db.collection('addresses').orderBy('address').get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        const address = doc.data().address
        if (address === '課題曲') this.kadaikyokuAddress = doc.id
        this.addresses.push({
          id: doc.id,
          name: address
        })
      })
    })

    // 一覧取得
    let json = await fetch('/json').then(res => {
      return res.json()
    }).then(json => {
      json = json as object || {}
      Object.keys(json).forEach(key => {
        const score = json[key]
        if (typeof score !== 'object') return
        this.scores.push(Object.assign(score, { id: key }))
      })
    }).catch(err => {
      this.scores.push({
        id: 'error',
        name: 'error',
        address: 'error'
      })
    })
  }

  editScore(score: IScore) {
    this.editTargetId = score.id
    this.editItem = {
      name: score.name,
      otherName: score.otherName || '',
      address: this.name2id(this.addresses, score.address),
      publisher: this.name2id(this.publishers, score.publisher),
      year: score.year || (new Date().getFullYear()),
      singer: score.singer || '',
      note: score.note || ''
    }
    this.dialog = true
  }

  deleteScore(score: IScore) {
    alert(`You can't delete yet.`)
  }

  close() {
    this.dialog = false
    this.errMsg = ''
    setTimeout(() => {
      this.editTargetId = ''
      this.editItem = Object.assign({}, this.defaultItem)
    }, 100)
  }

  async save() {
    this.loading = true
    const score = {
      name: this.editItem.name,
      otherName: this.editItem.otherName,
      address: this.db.collection('addresses').doc(this.editItem.address),
      publisher: (!this.isKadaikyoku && !!this.editItem.publisher)? this.db.collection('publishers').doc(this.editItem.publisher): null,
      year: (this.isKadaikyoku)? this.editItem.year: null,
      singer: (!this.isKadaikyoku)? this.editItem.singer: '',
      note: this.editItem.note
    }
    try {
      if (this.editTargetId === '') {
        const doc = await this.db.collection('scores').add(Object.assign(score, { createdAt: firebase.firestore.FieldValue.serverTimestamp() }))
        this.scores.push({
          id: doc.id,
          name: this.editItem.name,
          otherName: this.editItem.otherName,
          address: this.id2name(this.addresses, this.editItem.address),
          publisher: (!this.isKadaikyoku)? this.id2name(this.publishers, this.editItem.publisher): undefined,
          year: (this.isKadaikyoku)? this.editItem.year: undefined,
          singer: (!this.isKadaikyoku)? this.editItem.singer: '',
          note: this.editItem.note
        })
      } else {
        await this.db.collection('scores').doc(this.editTargetId).set(Object.assign(score, { updatedAt: firebase.firestore.FieldValue.serverTimestamp() }))
        this.scores.splice(this.scores.findIndex(val => val.id === this.editTargetId), 1)
        this.scores.push({
          id: this.editTargetId,
          name: this.editItem.name,
          otherName: this.editItem.otherName,
          address: this.id2name(this.addresses, this.editItem.address),//this.addresses.find(val => val.id === this.editItem.address).name,
          publisher: (!this.isKadaikyoku)? this.id2name(this.publishers, this.editItem.publisher): undefined,
          year: (this.isKadaikyoku)? this.editItem.year: undefined,
          singer: (!this.isKadaikyoku)? this.editItem.singer: '',
          note: this.editItem.note
        })
      }
      this.close()
    } catch (err) {
      this.errMsg = err.message
    } finally {
      this.loading = false
    }
  }
}
</script>