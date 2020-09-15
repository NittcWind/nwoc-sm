import { Score } from '@/types';
import Vue from 'vue';
import { scores } from './database';

export class Store {
  scores: Score[] = [];

  constructor() {
    scores.then((scrs) => {
      this.scores = scrs;
    });
  }

  addScore(score: Score): void {
    this.scores.push(score);
  }

  updateScore(score: Score): void {
    this.deleteScore(score);
    this.addScore(score);
  }

  deleteScore(score: Score | string): void {
    let id: string;
    if (typeof score !== 'string') {
      id = score.id;
    } else {
      id = score;
    }
    const index = this.scores.findIndex((scr) => scr.id === id);
    if (index === -1) return;
    this.scores.splice(index, 1);
  }
}

export const store = Vue.observable(new Store());
