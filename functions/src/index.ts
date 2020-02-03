import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as os from 'os'
import * as path from 'path'
import * as fs from 'fs'
const jconv = require('jconv')

//const serviceAccount = require('./secret-key.json')
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  //credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://nwoc-sm.firebaseio.com',
  storageBucket: 'nwoc-sm.appspot.com'
})
const firestore = admin.firestore()
const database = admin.database()
const bucket = admin.storage().bucket()

const scoresJsonPath = 'backup/scores.json'

interface IScore {
  [key: string]: string|undefined|number
  name: string
  otherName?: string
  address: string
  year?: number
  publisher?: string
  singer?: string
  note?: string
}
interface IScoreList {
  [key: string]: IScore
}
interface IStringKeyValue {
  [key: string]: string
}

const getIdValue = (collectionName: string, valName: string) => () => new Promise<IStringKeyValue>(async (resolve, reject) => {
  try {
    const obj: IStringKeyValue = {}
    const docSnap = await firestore.collection(collectionName).get()
    docSnap.forEach(doc => {
      obj[doc.id] = doc.data()[valName]
    })
    resolve(obj)
  } catch (err) {
    reject(err)
  }
})
const getPublishers = getIdValue('publishers', 'name')
const getAddresses = getIdValue('addresses', 'address')

// Firestoreから最新のスコア一覧を生成
const makeScoreList = () => new Promise<IScoreList>(async (resolve, reject) => {
  try {
    // 出版社と保管場所は参照で保存してるので参照を解決する
    const publishers: IStringKeyValue = await getPublishers()
    const addresses: IStringKeyValue = await getAddresses()

    // 一覧を取得
    const scores: IScoreList = {}
    const scoreSnap = await firestore.collection('scores').get()
    scoreSnap.forEach(async doc => {
      const data = doc.data()
      const address = addresses[data.address.id]
      let year,publisher
      if (address === '課題曲') {
        year = data.year
      } else {
        publisher = publishers[data.publisher.id]
      }
      const score: IScore = {
        name: data.name,
        otherName: data.otherName,
        address: address,
        year: year,
        publisher: publisher,
        singer: data.singer,
        note: data.note
      }
      // remove undefined value
      Object.keys(score).forEach(key => score[key] === undefined && delete score[key])
      scores[doc.id] = score
    })

    resolve(scores)
  } catch (err) {
    reject(err)
  }
})

// Firestoreからdatabaseとstorageにバックアップする
const backup = (scores: IScoreList, backupTo = { database: true, storage: true }) => new Promise<IScoreList>(async (resolve, reject) => {
  backupTo.database = (backupTo.database === false)? false: true
  backupTo.storage = (backupTo.storage === false)? false: true
  // 一時保管ファイルとそのディレクトリ
  const tmpDitPath = os.tmpdir()
  const tmpFilePath = path.join(tmpDitPath, 'tmp.json')
  // databaseの保存先
  const scoresRef = database.ref('scores')

  try {
    if (backupTo.database) {
      // Realtime Databaseにアップロード
      await scoresRef.set(scores)
    }
    if (backupTo.storage) {
      // Storageにアップロード
      const json = JSON.stringify(scores)
      fs.writeFileSync(tmpFilePath, json)
      await bucket.upload(tmpFilePath, {
        destination: scoresJsonPath,
        metadata: { contentType: 'application/json' }
      })
    }

    resolve(scores)
  } catch (err) {
    reject(err)
  } finally {
    // 生成した一時ファイルを削除
    if (fs.existsSync(tmpFilePath)) fs.unlinkSync(tmpFilePath)
  }
})

// Storageのバックアップからスコア一覧を取得，なければバックアップ生成
const getScoreList = () => new Promise<IScoreList>(async (resolve, reject) => {
  try {
    const file = bucket.file(scoresJsonPath)
    const [ exists ] = await file.exists()
    let scores: IScoreList | undefined

    // ファイルが存在しない場合，buckupして生成
    if (!exists) {
      scores = await backup(await makeScoreList())
    } else {
      const [ content ] = await file.download()
      scores = JSON.parse(content.toString()) as IScoreList
    }
    resolve(scores)
  } catch (err) {
    reject(err)
  }
})

// /backup にアクセスしてバックアップ生成
exports.backup = functions.https.onRequest(async (req, res) => {
  let statusCode = 200
  let content: string | object = ''

  try {
    content = await backup(await makeScoreList())
  } catch (err) {
    console.error(err)
    // エラーが発生したらサーバーエラー(500)で終了
    statusCode = 500
    content = `<h1>Error</h1><p>${JSON.stringify(err)}</p>`
  } finally {
    res.set('Content-Type', (typeof content === 'object')? 'application/json': 'text/html')
    res.send(content)
    res.status(statusCode)
    res.end()
  }
})

// /json にアクセスしてjsonでリスト取得
exports.json = functions.https.onRequest(async (req, res) => {
  const scores = await getScoreList()

  res.set('Content-Disposition', 'inline; filename="backup_scores.json"')
  res.set('Content-Type', 'application/json')
  res.send(scores)
  res.status(200)
  res.end()
})

const encloseValueInQuotes = (val: string = '') => `"${val.replace(/"/g, '""')}"`

// /csv にアクセスしてcsvでリスト取得
exports.csv = functions.https.onRequest(async (req, res) => {
  const scores = await getScoreList()
  const csv = 'ID,正式名称,別名,保管場所,年,出版社,歌手,備考\n' + Object.keys(scores).map(key => {
    const score = scores[key]
    return [
      key,
      encloseValueInQuotes(score.name),
      encloseValueInQuotes(score.otherName),
      encloseValueInQuotes(score.address),
      encloseValueInQuotes((!score.year)? '': `${score.year}`),
      encloseValueInQuotes(score.publisher),
      encloseValueInQuotes(score.singer),
      encloseValueInQuotes(score.note)
    ].join(',')
  }).join('\n')

  res.set('Content-Disposition', 'inline; filename="backup_scores.csv"')
  res.set('Content-Type', 'text/csv; charset=Shift_JIS')
  res.write(jconv.convert(csv, 'UTF8', 'SJIS'))
  res.status(200)
  res.end()
})

// Firestoreの変更（楽譜の追加・編集）検知
exports.updateBackup = functions.firestore.document('scores/{scoreId}').onWrite(async (change, context) => {
  try {
    // 出版社と保管場所は参照で保存してるので参照を解決する
    const publishers: IStringKeyValue = await getPublishers()
    const addresses: IStringKeyValue = await getAddresses()

    const data = change.after.data()
    if (typeof data === 'undefined') return
    const address = addresses[data.address.id]
    let year,publisher
    if (address === '課題曲') {
      year = data.year
    } else {
      publisher = publishers[data.publisher.id]
    }
    const score: IScore = {
      name: data.name,
      otherName: data.otherName,
      address: address,
      year: year,
      publisher: publisher,
      singer: data.singer,
      note: data.note
    }
    // remove undefined value
    Object.keys(score).forEach(key => score[key] === undefined && delete score[key])
    // write changes to database
    await database.ref('scores').child(context.params.scoreId).set(score)

    const snap = await database.ref('scores').once('value')
    const scores: IScoreList = snap.val() || {}
    await backup(scores, { database: false, storage: true })
  } catch (err) {
    console.error(err)
  }
})