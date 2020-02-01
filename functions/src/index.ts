import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as os from 'os'
import * as path from 'path'
import * as fs from 'fs'

//const serviceAccount = require('./secret-key.json')
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  //credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://nwoc-sm.firebaseio.com',
  storageBucket: 'nwoc-sm.appspot.com'
})
const firestore = admin.firestore()
const bucket = admin.storage().bucket()

interface IScores {
  [key: string]: object
}
interface IStringKeyValue {
  [key: string]: string
}

exports.backup = functions.https.onRequest((req, res) => {
  const publishers: IStringKeyValue = {}
  const addresses: IStringKeyValue = {}

  firestore.collection('publishers').get().then(querySnapshot => {
    querySnapshot.forEach(doc => {
      publishers[doc.id] = doc.data().name
    })
  }).catch(err => {
    res.statusCode = 500
    res.send('<p>Publisher error</p>')
    res.send(err)
    res.end()
  })
  firestore.collection('addresses').get().then(querySnapshot => {
    querySnapshot.forEach(doc => {
      addresses[doc.id] = doc.data().address
    })
  }).catch(err => {
    res.statusCode = 500
    res.send('<p>Addresses error</p>')
    res.send(err)
    res.end()
  })

  const tmpDitPath = os.tmpdir()
  const tmpFilePath = path.join(tmpDitPath, 'tmp.json')
  const obj: IScores = {}
  firestore.collection('scores').get().then(querySnapshot => {
    querySnapshot.forEach(doc => {
      const data = doc.data()
      const address = addresses[data.address.id]
      let year,publisher
      if (address === '課題曲') {
        year = data.year
      } else {
        publisher = publishers[data.publisher.id]
      }
      obj[doc.id] = {
        name: data.name,
        otherName: data.otherName,
        address: address,
        year: year,
        publisher: publisher,
        singer: data.singer,
        note: data.note
      }
    })
    res.send(`<p>${JSON.stringify(obj)}</p>`)

    fs.writeFileSync(tmpFilePath, JSON.stringify(obj))
    return bucket.upload(tmpFilePath, {
      destination: 'backup/scores.json',
      metadata: { contentType: 'application/json' }
    })
  }).then(val => {
    res.statusCode = 200
    res.send('<p>Complete</p>')
    res.end()
    fs.unlinkSync(tmpFilePath)
  }).catch(err => {
    res.statusCode = 500 
    res.send('<p>Error</p>')
    res.send(err)
    res.end()
    fs.unlinkSync(tmpFilePath)
  })
})