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

// Firestoreから最新のスコア一覧を生成
const makeScoreList = () => new Promise<IScoreList>(async (resolve, reject) => {
  try {
    // 出版社と保管場所は参照で保存してるので参照を解決する
    const publishers: IStringKeyValue = {}  // 出版社
    const addresses: IStringKeyValue = {}   // 保管場所
    const pubSnap = await firestore.collection('publishers').get()
    pubSnap.forEach(doc => {
      publishers[doc.id] = doc.data().name
    })
    const adrSnap = await firestore.collection('addresses').get()
    adrSnap.forEach(doc => {
      addresses[doc.id] = doc.data().address
    })

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
const backup = () => new Promise<IScoreList>(async (resolve, reject) => {
  // 一時保管ファイルとそのディレクトリ
  const tmpDitPath = os.tmpdir()
  const tmpFilePath = path.join(tmpDitPath, 'tmp.json')
  // databaseの保存先
  const scoresRef = database.ref('scores')

  try {
    const scores = await makeScoreList()
    // Realtime Databaseにアップロード
    await scoresRef.set(scores)
    // Storageにアップロード
    const json = JSON.stringify(scores)
    fs.writeFileSync(tmpFilePath, json)
    await bucket.upload(tmpFilePath, {
      destination: scoresJsonPath,
      metadata: { contentType: 'application/json' }
    })

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
      scores = await backup()
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
    content = await backup()
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
      encloseValueInQuotes(`${score.year}`),
      encloseValueInQuotes(score.publisher),
      encloseValueInQuotes(score.singer),
      encloseValueInQuotes(score.note)
    ].join(',')
  }).join('\n')

  res.set('Content-Disposition', 'attachment; filename="backup_scores.csv"')
  res.set('Content-Type', 'text/csv; charset=Shift_JIS')
  res.write(jconv.convert(csv, 'UTF8', 'SJIS'))
  res.status(200)
  res.end()
})