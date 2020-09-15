import { Score } from '@/types';
import firebase from 'firebase';
import { firestore } from './firebase';
import { isProduction } from './utils';

const invertMap = <K, V>(map: Map<K, V>) => new Map<V, K>(
  [...map].map(([k, v]) => [v, k]),
);

const addressesRef = firestore.collection('addresses');
export const addresses = addressesRef
  .orderBy('address')
  .get({
    source: isProduction
      ? 'cache'
      : 'server',
  })
  .catch((err) => {
    console.warn('Cache has no addresses', err);
    return addressesRef.orderBy('address').get({ source: 'server' });
  })
  .then((querySnapshot) => {
    const adrs = new Map<string, string>();
    querySnapshot.forEach((doc) => {
      adrs.set(doc.id, doc.data().address as string);
    });
    return adrs;
  })
  .catch((err) => {
    console.error('Cannot get addresses.', err);
    return new Map<string, string>();
  });
export const invAddresses = addresses.then((adrs) => invertMap(adrs));

const publishersRef = firestore.collection('publishers');
export const publishers = publishersRef
  .orderBy('name')
  .get({
    source: isProduction
      ? 'cache'
      : 'server',
  })
  .catch((err) => {
    console.warn('Cache has no pulishers', err);
    return publishersRef.orderBy('name').get({ source: 'server' });
  })
  .then((querySnapshot) => {
    const pubs = new Map<string, string>();
    querySnapshot.forEach((doc) => {
      pubs.set(doc.id, doc.data().name);
    });
    return pubs;
  })
  .catch((err) => {
    console.error('Cannot get publishers.', err);
    return new Map<string, string>();
  });
export const invPublishers = publishers.then((pubs) => invertMap(pubs));

const scoresRef = firestore.collection('scores');
export const scores = scoresRef
  .get({
    source: isProduction
      ? 'server'
      : 'cache',
  })
  .catch((err) => {
    console.warn('Server can\'t return scores', err);
    return scoresRef.get({ source: 'cache' });
  })
  .then((querySnapshot) => {
    const scrs: Score[] = [];
    querySnapshot.forEach(async (doc) => {
      const score = doc.data();
      if (!score.address?.id) {
        console.log(score, doc);
      }
      score.address = (await addresses).get(score.address.id) || '';
      score.publisher = score.publisher
        ? (await publishers).get(score.publisher.id)
        : undefined;
      scrs.push({ ...score, id: doc.id } as Score);
    });
    return scrs;
  })
  .catch((err) => {
    console.error('Cannot get scores.', err);
    return [] as Score[];
  });

export const saveScore = async (score: Score): Promise<void> => {
  let docRef;
  if (score.id === '') {
    docRef = await scoresRef.add({
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    if (!docRef) return;
  } else {
    docRef = scoresRef.doc(score.id);
  }

  const isKadaikyoku = score.address === '課題曲';
  const adrsRef = addressesRef.doc((await invAddresses).get(score.address));
  const pubsRef = score.publisher
    ? publishersRef.doc((await invPublishers).get(score.publisher))
    : null;

  docRef.update('name', score.name.trim());
  docRef.update('otherName', score.otherName?.trim() ?? '');
  docRef.update('address', adrsRef);
  docRef.update('publisher', !isKadaikyoku ? pubsRef : null);
  docRef.update('singer', score.singer?.trim() ?? '');
  docRef.update('year', isKadaikyoku ? score.year : null);
  docRef.update('note', score.note?.trim() ?? '');
  docRef.update('updatedAt', firebase.firestore.FieldValue.serverTimestamp());
};

export const deleteScore = async (score: Score): Promise<void> => scoresRef.doc(score.id).delete();
