<template>
  <v-expansion-panels
    accordion
    :multiple="!pcView"
    tile
    hover
  >
    <v-expansion-panel readonly>
      <v-expansion-panel-header hide-actions>
        <template v-if="pcView">
          <v-row>
            <v-col
              v-for="info in itemInfos"
              :key="info.name"
              :cols="info.cols"
              class="pa-0"
            >
              {{ info.text }}
            </v-col>
          </v-row>
        </template>
        <template v-else>
          名称
        </template>
      </v-expansion-panel-header>
    </v-expansion-panel>
    <v-expansion-panel
      v-for="score in scores"
      :key="score.id"
    >
      <v-expansion-panel-header :hide-actions="pcView">
        <template v-if="pcView">
          <v-row>
            <v-col
              v-for="info in itemInfos"
              :key="info.name"
              :cols="info.cols"
              class="pa-0"
            >
              {{ score[info.propName] }}
            </v-col>
          </v-row>
        </template>
        <template v-else>
          {{ score.name }}
        </template>
      </v-expansion-panel-header>
      <v-expansion-panel-content class="pa-0">
        <v-row justify="end" v-if="pcView">
          <v-col class="pa-0" cols="1">
            <v-btn icon small @click="edit(score)">
              <v-icon>{{ icons.mdiPencil }}</v-icon>
            </v-btn>
            <v-btn icon small @click="del(score)">
              <v-icon>{{ icons.mdiDelete }}</v-icon>
            </v-btn>
          </v-col>
        </v-row>
        <v-simple-table dense v-else>
          <tbody>
            <tr
              v-for="info in itemInfos.filter(info => !info.pcOnly)"
              :key="info.text"
            >
              <th>{{ info.text }}</th>
              <td>{{ score[info.propName] }}</td>
            </tr>
            <tr>
              <th>Actions</th>
              <td>
                <v-btn icon small @click="edit(score)">
                  <v-icon>{{ icons.mdiPencil }}</v-icon>
                </v-btn>
                <v-btn icon small @click="del(score)">
                  <v-icon>{{ icons.mdiDelete }}</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-simple-table>
      </v-expansion-panel-content>
    </v-expansion-panel>
    <edit-dialog
      :open="editing"
      :item="editItem"
      @close="editing = false"
    />
    <delete-dialog
      :open="deleting"
      :item="deleteItem"
      @close="deleting = false"
    />
  </v-expansion-panels>
</template>

<script lang="ts">
import { Score } from '@/types';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mdiPencil, mdiDelete } from '@mdi/js';
import { generateBlankScore } from '@/utils/utils';
// import EditDialog from './EditDialog.vue';
const EditDialog = () => import('./EditDialog.vue');
// import DeleteDialog from './DeleteDialog.vue';
const DeleteDialog = () => import('./DeleteDialog.vue');

@Component({
  components: {
    EditDialog,
    DeleteDialog,
  },
})
export default class ScoreTableMain extends Vue {
  @Prop({ required: true }) scores!: Score[]
  editItem: Score = generateBlankScore()
  editing = false
  deleteItem: Score = generateBlankScore()
  deleting = false

  itemInfos = [
    {
      text: '名称', propName: 'name', cols: 3, pcOnly: true,
    },
    { text: '別名', propName: 'otherName', cols: 2 },
    { text: '保管場所', propName: 'address', cols: 1 },
    { text: '年', propName: 'year', cols: 1 },
    { text: '出版社', propName: 'publisher', cols: 1 },
    { text: 'アーティスト', propName: 'singer', cols: 1 },
    { text: '備考', propName: 'note', cols: 3 },
  ]
  icons = {
    mdiPencil,
    mdiDelete,
  }

  get pcView(): boolean {
    return !this.$vuetify.breakpoint.smAndDown;
  }

  edit(item: Score): void {
    this.editItem = { ...item };
    this.editing = true;
  }

  del(item: Score): void {
    this.deleteItem = { ...item };
    this.deleting = true;
  }
}
</script>

<style lang="scss" scoped>
button[type=button] {
  cursor: auto;
}
</style>
