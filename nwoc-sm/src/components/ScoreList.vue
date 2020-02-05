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
          <v-dialog v-model="editForm.dialog" persistent :max-width="maxWidth">
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
                :active="editForm.loading"
                :indeterminate="editForm.loading"
              />
              <v-card-title>
                <v-text-field
                  required
                  label="正式名"
                  v-model="editForm.item.name"
                />
              </v-card-title>
              <v-card-text>
                <v-text-field
                  label="別名"
                  v-model="editForm.item.otherName"
                />
                <v-select
                  required
                  label="保管場所"
                  :items="addresses"
                  item-text="name"
                  item-value="id"
                  v-model="editForm.item.address"
                />
                <v-select
                  v-if="!isKadaikyoku"
                  label="出版社"
                  :items="publishers"
                  item-text="name"
                  item-value="id"
                  v-model="editForm.item.publisher"
                />
                <v-text-field
                  v-if="isKadaikyoku"
                  type="number"
                  label="年"
                  min="1940" max="2200"
                  v-model="editForm.item.year"
                />
                <v-text-field
                v-if="!isKadaikyoku"
                  label="歌手"
                  v-model="editForm.item.singer"
                />
                <v-textarea
                  label="備考"
                  v-model="editForm.item.note"
                />
                <v-alert
                  v-if="!!editForm.errorMessage"
                  dense
                  outlined
                  type="error"
                >
                  {{ editForm.errorMessage }}
                </v-alert>
              </v-card-text>
              <v-card-actions>
                <v-btn
                  text
                  @click="editForm.close()"
                >
                  Cancel
                </v-btn>
                <v-spacer />
                <v-btn
                  text
                  color="primary"
                  @click="editForm.save()"
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
            clearable
            dense
          />
        </v-toolbar>
      </template>
      <template v-slot:item.action="{ item }">
        <v-icon
          small
          class="mr-2"
          @click="editForm.edit(item)"
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
import { Component, Vue, Watch } from 'vue-property-decorator'
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
  db = firebase.firestore()

  id2name(arr: IPublishers[] | IAdresses[], id: string = ''): string {
    const target = arr.find(val => val.id === id)
    return (target && target.name) || ''
  }
  name2id(arr: IPublishers[] | IAdresses[], name: string = ''): string {
    const target = arr.find(val => val.name === name)
    return (target && target.id) || ''
  }

  // dialog
  maxWidth = 640

  // edit dialog variables(constants)
  editForm = {
    self: this as ScoreList,
    dialog: false,
    loading: false,
    targetId: '',
    item: {
      name: '',
      otherName: '',
      address: '',
      publisher: '',
      year: (new Date()).getFullYear(),
      singer: '',
      note: ''
    },
    default: {
      name: '',
      otherName: '',
      address: '',
      publisher: '',
      year: (new Date()).getFullYear(),
      singer: '',
      note: ''
    },
    errorMessage: '',
    edit(score: IScore) {
      this.targetId = score.id
      this.item = {
        name: score.name,
        otherName: score.otherName || '',
        address: this.self.name2id(this.self.addresses, score.address),
        publisher: this.self.name2id(this.self.publishers, score.publisher),
        year: score.year || (new Date().getFullYear()),
        singer: score.singer || '',
        note: score.note || ''
      }
      this.dialog = true
    },
    close() {
      this.dialog = false
      this.errorMessage = ''
      setTimeout(() => {
        this.targetId = ''
        this.item = Object.assign({}, this.default)
      }, 100)
    },
    async save() {
      this.loading = true
      const name = this.item.name.trim()
      const otherName = this.item.otherName.trim()
      const singer = (!this.self.isKadaikyoku)? this.item.singer.trim(): ''
      const note = this.item.note.trim()
      const score = {
        name, otherName, singer, note,
        address: this.self.db.collection('addresses').doc(this.item.address),
        publisher: (!this.self.isKadaikyoku && !!this.item.publisher)? this.self.db.collection('publishers').doc(this.item.publisher): null,
        year: (this.self.isKadaikyoku)? this.item.year: null
      }
      try {
        const data = {
          name, otherName, singer, note,
          address: this.self.id2name(this.self.addresses, this.item.address),
          publisher: (!this.self.isKadaikyoku)? this.self.id2name(this.self.publishers, this.item.publisher): undefined,
          year: (this.self.isKadaikyoku)? this.item.year: undefined
        }
        if (this.targetId === '') {
          const doc = await this.self.db.collection('scores').add(Object.assign(score, { createdAt: firebase.firestore.FieldValue.serverTimestamp() }))
          this.self.scores.push(Object.assign(data, { id: doc.id }))
        } else {
          await this.self.db.collection('scores').doc(this.targetId).set(Object.assign(score, { updatedAt: firebase.firestore.FieldValue.serverTimestamp() }))
          this.self.scores.splice(this.self.scores.findIndex(val => val.id === this.targetId), 1)
          this.self.scores.push(Object.assign(data, { id: this.targetId }))
        }
        this.close()
      } catch (err) {
        this.errorMessage = err.message
      } finally {
        this.loading = false
      }
    }
  }
  kadaikyokuAddress = ''
  get isKadaikyoku() {
    return this.kadaikyokuAddress === this.editForm.item.address
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
  @Watch('searchText')
  onSearchTextChange() {
    history.replaceState(null, '', (this.searchText)? `?s=${this.searchText}`: '/')
  }
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
  sortBy = ['address', 'name']
  width = window.innerWidth
  get itemsPerPage() {
    return (this.width < this.mobileBreakpoint)? this.minItemsPerPage: this.maxItemsPerPage
  }
  
  // on mount
  async mounted() {
    // 表示数変更のためのリサイズイベント
    window.addEventListener('resize', () => {
      this.width = window.innerWidth
    })

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
}
</script>