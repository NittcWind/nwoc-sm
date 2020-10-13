import { ScoreProp } from '@/types';

// eslint-disable-next-line import/prefer-default-export
export const scoreProps: ScoreProp[] = [
  {
    text: '名称', propName: 'name', cols: 3, pcOnly: true,
  },
  { text: '別名', propName: 'otherName', cols: 2 },
  { text: '保管場所', propName: 'address', cols: 1 },
  { text: '年', propName: 'year', cols: 1 },
  { text: '出版社', propName: 'publisher', cols: 1 },
  { text: 'アーティスト', propName: 'singer', cols: 1 },
  { text: '備考', propName: 'note', cols: 3 },
];
