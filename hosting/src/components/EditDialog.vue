<template>
  <v-dialog v-model="open" persistent :max-width="maxWidth">
    <v-card>
      <v-form
        ref="form"
        v-model="valid"
        @submit.prevent="save()"
      >
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
            v-model="item.name"
            :rules="validationRules.name"
          />
        </v-card-title>
        <v-card-text>
          <v-text-field
            label="別名"
            v-model="item.otherName"
            :rules="validationRules.otherName"
          />
          <v-select
            required
            label="保管場所"
            item-text="name"
            item-value="name"
            :items="addresses"
            v-model="item.address"
            :rules="validationRules.address"
          />
          <v-select
            v-if="!isKadaikyoku"
            label="出版社"
            item-text="name"
            item-value="name"
            :items="publishers"
            v-model="item.publisher"
            :required="!isKadaikyoku"
            :rules="validationRules.publisher"
          />
          <v-text-field
            v-if="isKadaikyoku"
            type="number"
            label="年"
            min="1940" max="2200"
            v-model.number="item.year"
            :required="isKadaikyoku"
            :rules="validationRules.year"
          />
          <v-text-field
            v-if="!isKadaikyoku"
            label="歌手"
            v-model="item.singer"
            :rules="validationRules.singer"
          />
          <v-textarea
            label="備考"
            v-model="item.note"
            :rules="validationRules.note"
          />
          <v-alert
            v-if="!!errorMessage"
            dense
            outlined
            type="error"
          >
            {{ errorMessage }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-btn
            text
            @click="close()"
          >
            Cancel
          </v-btn>
          <v-spacer />
          <v-btn
            text
            color="primary"
            type="submit"
            :disabled="!valid"
          >
            OK
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
import { IdNameRecord, Score, ValidateResult } from '@/types';
import {
  addresses, isRequire, lengthCheck, publishers, saveScore,
} from '@/utils/utils';

@Component
export default class EditDialog extends Vue {
  @Prop({ required: true }) open!: boolean
  @Prop({ required: true }) item?: Score

  maxWidth = 640
  valid = false
  errorMessage = ''
  loading = false
  publishers: readonly IdNameRecord[] = []
  addresses: readonly IdNameRecord[] = []

  validationRules = {
    name: [isRequire, lengthCheck('正式名', 100, true)],
    otherName: [lengthCheck('別名', 100)],
    address: [(v: string): ValidateResult => !!v || '保管場所を選択してください。'],
    year: [(v: number): ValidateResult => (this.isKadaikyoku && !!v && v > 1940 && v < 2200) || '年を入力してください。'],
    publisher: [(v: string): ValidateResult => (!this.isKadaikyoku && !!v) || '出版社を選択してください。'],
    singer: [lengthCheck('歌手', 100)],
    note: [lengthCheck('備考', 500)],
  }

  @Watch('open')
  resetValidation(): void {
    const form = this.$refs.form as unknown as Record<string, unknown> | undefined;
    if (typeof form?.resetValidation === 'function') {
      form.resetValidation();
    }
  }

  get isKadaikyoku(): boolean {
    return this.item?.address === '課題曲';
  }

  close(): void {
    this.$emit('close');
    this.errorMessage = '';
  }

  async mounted(): Promise<void> {
    this.publishers = [...(await publishers)].map(([id, name]) => ({ id, name }));
    this.addresses = [...(await addresses)].map(([id, name]) => ({ id, name }));
  }

  save(): void {
    if (!this.item || !this.valid) return;
    this.loading = true;
    saveScore(this.item)
      .then(this.close)
      .catch((err: Error) => {
        console.error(err);
        this.errorMessage = err.message;
      })
      .finally(() => {
        this.loading = false;
      });
  }
}
</script>
