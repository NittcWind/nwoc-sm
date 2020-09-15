<template>
  <v-dialog v-model="open" persistent :max-width="maxWidth">
    <v-card>
      <v-card-title>
        この楽譜を削除しますか？
      </v-card-title>
      <v-card-text>
        <v-alert dense type="warning">
          削除を行うと元には戻せません。
        </v-alert>
        <p>正式名を入力して削除を確定してください。</p>
        <v-text-field :placeholder="item && item.name" v-model="name" />
      </v-card-text>
      <v-card-actions>
        <v-btn text @click="close()">
          Cancel
        </v-btn>
        <v-spacer />
        <v-btn
          :disabled="!item || item.name != name"
          class="white--text"
          color="red"
          depressed
          @click="del()"
        >
          OK
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Score } from '@/types';
import { deleteScore } from '@/utils/utils';
import {
  Component, Emit, Prop, Vue,
} from 'vue-property-decorator';

@Component
export default class DeleteDialog extends Vue {
  @Prop({ required: true }) open!: boolean
  @Prop() item?: Score
  maxWidth = 640
  name = ''

  @Emit()
  close(): void {
    this.name = '';
  }

  del(): void {
    if (this.name === '' || this.name !== this.item?.name) return;
    deleteScore(this.item).catch((err) => {
      console.error(err);
    }).finally(() => {
      this.close();
    });
  }
}
</script>
