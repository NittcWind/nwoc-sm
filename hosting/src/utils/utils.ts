import { firestore } from './firebase'
import { Score } from '@/types'

export const getUrlParam = (() => {
  const params = new URL(window.location.href).searchParams
  return (key: string) => {
    const result = params.get(key)
    if (result == null) return null
    return decodeURIComponent(result)
  }
})()

export const addresses = firestore
  .collection('addresses')
  .orderBy('address').get()
  .then(querySnapshot => {
    const addresses = new Map<string, string>()
    querySnapshot.forEach(doc => {
      addresses.set(doc.id, doc.data().address as string)
    })
    return addresses
  })
  .catch((err) => {
    console.error('Cannot get addresses.', err)
    return new Map<string, string>()
  })

export const addressNames = addresses.then(adrs => [...adrs.values()] as const)

export const publishers = firestore
  .collection('publishers')
  .orderBy('name').get()
  .then(querySnapshot => {
    const publishers = new Map<string, string>();
    querySnapshot.forEach(doc => {
      publishers.set(doc.id, doc.data().name)
    })
    return publishers
  })
  .catch((err) => {
    console.error('Cannot get publishers.', err)
    return new Map<string, string>()
  })

export const publisherNames = publishers.then(pubs => [...pubs.values()] as const)

export const scores = firestore
  .collection('scores').get()
  .then(querySnapshot => {
    const scores: Score[] = []
    querySnapshot.forEach(async doc => {
      const score = doc.data()
      score.address = (await addresses).get(score.address.id) || ''
      score.publisher = score.publisher
        ? (await publishers).get(score.publisher.id)
        : undefined
      scores.push(Object.assign(score, { id: doc.id }) as Score)
    })
    return scores
  })
  .catch((err) => {
    console.error('Cannot get scores.', err)
    return [] as Score[]
  })

export const isRequire = (val: string) => !!val || '必須項目です。'

export const lengthCheck = (formName: string, max: number, required: boolean = false) => {
  return required
    ? (val: string) => val.length <= max || `${formName}は${max}文字以内で入力してください。`
    : (val: string) => (val.length === 0 || val.length <= max) || `${formName}は${max}文字以内で入力してください。`
}
