import { firestore } from './firebase'

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
  .orderBy('address')
  .get().then(querySnapshot => {
    const addresses = new Map<string, string>()
    querySnapshot.forEach(doc => {
      addresses.set(doc.id, doc.data().address as string)
    })
    return addresses
  })
