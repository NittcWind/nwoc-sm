<template>
  <v-list-item
    @click.stop="dialog = !dialog"
  >
    <v-list-item-content>
      <v-list-item-title>
        {{ score.name }}
      </v-list-item-title>
      <v-list-item-subtitle v-if="score.otherName">
        {{ score.otherName}}
      </v-list-item-subtitle>
    </v-list-item-content>
    <v-dialog
      v-model="dialog"
      max-width="640"
    >
      <v-card
        max-width="640"
      >
        <v-card-title>
          {{ score.name }}
        </v-card-title>
        <v-card-subtitle>
          {{ score.otherName }}
        </v-card-subtitle>
        <v-card-text>
          <v-list>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>
                  保管場所
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ score.address }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item v-if="score.year">
              <v-list-item-content>
                <v-list-item-title>
                  年
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ score.year }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item v-if="score.publisher">
              <v-list-item-content>
                <v-list-item-title>
                  出版社
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ score.publisher }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>
                  備考
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ score.note }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-list-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { IScore } from '../types'

@Component
export default class ScoreItem extends Vue {
  @Prop({ required: true }) score!: IScore
  dialog: boolean = false
}
</script>