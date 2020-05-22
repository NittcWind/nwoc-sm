import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as os from 'os'
import * as path from 'path'
import * as fs from 'fs'
import * as PdfDocument from 'pdfkit'
const PdfTable = require('voilab-pdf-table')
const Fitcolumn = require('voilab-pdf-table/plugins/fitcolumn')
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

// publishers, addressesの一覧取得
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
        publisher = (data.publisher)? publishers[data.publisher.id]: ''
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

// /pdf にアクセスしてPDFファイル取得
exports.pdf = functions.https.onRequest(async (req, res) => {
  const title = '豊田高専吹奏楽部 楽譜一覧'
  const pdf = new PdfDocument({
    size: 'A4',
    layout: 'landscape',
    margin: 40,
    info: {
      Creator: 'nwoc Score Manager',
      CreationDate: new Date(),
      Title: title,
      Author: 'nwoc-sm'
    },
    bufferPages: true
  })
  const table = new PdfTable(pdf)
  const scores = await getScoreList()
  //interface I { [key: string]: { address: string; name: string; } }
  //const scores = {"09Qv9qQ9IYomRkwj7OKe":{"address":"E","name":"Elsa's Procession to the Cathedral","note":"エルザの大聖堂への行進（行列）","otherName":"","publisher":"その他","singer":""},"0B1syPoggNmmHgunVine":{"address":"R","name":"READY!!","note":"","otherName":"","publisher":"その他","singer":""},"0ZhoyM3NrYUqVzxqTCPT":{"address":"課題曲","name":"マーチ「ライジング・サン」","note":"新井千悦子　作曲","otherName":"March \"The rising sun\"","singer":"","year":"1997"},"0kxkyrNVPahoC94fxCon":{"address":"D","name":"Dirty Work","note":"郷間幹男　他\nブルゾンちえみ","otherName":"","publisher":"ウィンズスコア","singer":"Austin Mahone"},"0t8JGzjw5AAqlTsNPqcR":{"address":"課題曲","name":"平和への行列","note":"戸田顕　作曲","otherName":"","singer":"","year":"2001"},"0wXacncV9eDczrVGcJCa":{"address":"A","name":"A Child's Lullaby","note":"","otherName":"","publisher":"その他","singer":""},"15M81OrTotgHjkXn2p8b":{"address":"M","name":"MIDWAY MARCH","note":"John Williams","otherName":"ミッドウェイ・マーチ","publisher":"その他","singer":""},"16sdmYhdKg4Ys0HE5nLm":{"address":"課題曲","name":"アップル・マーチ","note":"野村正憲　作曲","otherName":"","singer":"","year":"1995"},"1ADh2lxzKdGdfX3NdKci":{"address":"課題曲","name":"スター・パズル・マーチ","note":"小長谷宗一　作曲","otherName":"","singer":"","year":"1993"},"1CCdFv1rORs2qTH6JJvw":{"address":"E","name":"EL CAMINO REAL","note":"","otherName":"エル・カミーノ・レアル","publisher":"その他","singer":""},"1ILyvDQxnF6wHE82cVKK":{"address":"H","name":"HERO -Main Title-2014","note":"ドラマ「Hero」\n木村拓哉","otherName":"","publisher":"ウィンズスコア","singer":""},"1LBQrdqJwH5WX2fvrK8v":{"address":"M","name":"MAMMA MIA!","note":"Highlights From the Broadway Musical","otherName":"マンマ・ミーア!","publisher":"その他","singer":""},"1OXJ8uq9SmsTnH0sJ7RM":{"address":"C","name":"Coppelia 2nd Suite","note":"","otherName":"","publisher":"その他","singer":""},"1V2OpuxO3yFJwxhC5v8m":{"address":"D","name":"Dragon Night","note":"","otherName":"","publisher":"ウィンズスコア","singer":"SEKAI NO OWARI"},"1WPW8Rh9lZ34PV8SeWFw":{"address":"S","name":"SEPTEMBER","note":"","otherName":"","publisher":"その他","singer":""},"1a59nXEwXOHTBym0bZmA":{"address":"課題曲","name":"吹奏楽のための序曲 南の島から -沖縄旋律による-","note":"服部公一　作曲","otherName":"","singer":"","year":"1980"},"1ejWk15HXToBH4NREC2m":{"address":"S","name":"STAR WARS (Main Thema)","note":"","otherName":"","publisher":"その他","singer":""},"1kl7LBlNUCci1IZCHcin":{"address":"課題曲","name":"16世紀のシャンソンによる変奏曲","note":"諏訪　雅彦　作曲","otherName":"Variations on a 16th Century Chanson","singer":"","year":"2009"},"1ruo0wZvoi1eInZxqGwh":{"address":"課題曲","name":"行進曲 オーバー・ザ・ギャラクシー （銀河を越えて）","note":"斎藤高順　作曲","otherName":"","singer":"","year":"1980"},"21khS8wyiObaspyA8Hhq":{"address":"T","name":"THE WAY WE WERE 追憶のテーマ","note":"","otherName":"","publisher":"その他","singer":""},"2GndyGn7A1DDk1GbLt9f":{"address":"I","name":"I AM YOUR SINGER","note":"","otherName":"","publisher":"ミュージックエイト","singer":"サザンオールスターズ"},"2TiMOljHLGsCotDFgb5O":{"address":"S","name":"SYMPHONIC MOVEMENT","note":"","otherName":"","publisher":"その他","singer":""},"2fYpJ7zyImPvP55P966j":{"address":"O","name":"OLYMPICA","note":"Festival Overture for Band","otherName":"","publisher":"その他","singer":""},"3GiYBaZCRDUPvB8Hs9cJ":{"address":"課題曲","name":"吹奏楽のための序曲","note":"間宮芳生　作曲","otherName":"","singer":"","year":"1986"},"3Sxg0m0fq0g4gjcx7NOk":{"address":"P","name":"Pecori Night","note":"","otherName":"","publisher":"その他","singer":""},"3aCuDk8kzffYMsjrEBFP":{"address":"P","name":"PICTURES AT AN EXHIBITION PartⅢ","note":"","otherName":"","publisher":"その他","singer":""},"3hVqrHUAi7tjBB9sGflX":{"address":"課題曲","name":"吹奏楽のためのラメント","note":"高昌師　作曲","otherName":"","singer":"","year":"2002"},"3ltBV36DWkVUxMUPQogM":{"address":"B","name":"Believe","note":"","otherName":"","publisher":"ミュージックエイト","singer":""},"3xWvhK7GtgU5nDDKeBIv":{"address":"H","name":"Hungarian Rhapsody No.2","note":"","otherName":"ハンガリー狂詩曲第2番","publisher":"その他","singer":""},"414KSjHpwuJtfucyoe0U":{"address":"課題曲","name":"鳥たちの神話","note":"藤井修　作曲","otherName":"","singer":"","year":"2004"},"475NkE4PSLoIBKfP2ZUa":{"address":"L","name":"LES COULEURS FAUVES","note":"","otherName":"レ・クルール・フォーヴ","publisher":"その他","singer":""},"4YjtgFFdLcWv9esFSUR4":{"address":"J","name":"JAPANESE FOLK SONG SUITE WARABE UTA","note":"Where Are You From? あんたがたどこさ\nLullaby 子守歌\nAn Ancient Priest in a Moutain Temple 山寺のお尚さん","otherName":"わらべ唄","publisher":"その他","singer":""},"4aIeSO6wzvf6AKEAXobB":{"address":"P","name":"PACHELBEL'S CANON","note":"","otherName":"","publisher":"その他","singer":""},"4cboJeQerofeKxpnusZ5":{"address":"課題曲","name":"マーチ「カタロニアの栄光」","note":"間宮芳生　作曲","otherName":"","singer":"","year":"1990"},"4pFt4ZJKJo9JE0nRSt7I":{"address":"P","name":"Priestermars uit,,Athalia\"","note":"","otherName":"","publisher":"その他","singer":""},"4y3URCvWw9kCkaw0u1gR":{"address":"課題曲","name":"吹奏楽のための一章","note":"堀内俊男　作曲","otherName":"","singer":"","year":"2006"},"524PPfsErpeUFY3y7JDB":{"address":"課題曲","name":"天空の旅－吹奏楽のための譚詩－","note":"石原勇太郎","otherName":"Pilgrimage - Ballade for wind orchestra","singer":"","year":"2015"}} as I

  pdf.font('fonts/migmix-2p-regular.ttf')
  pdf.fontSize(10.5)
  table.addPlugin(new Fitcolumn({
    column: 'note'
  }))
  table.setColumnsDefaults({
    headerBorder: 'B',
    border: 'B'
  })
  table.addColumns([
    { id: 'name', header: '正式名', width: 200 },
    { id: 'otherName', header: '別名', width: 200 },
    { id: 'address', header: '保管場所', width: 50 },
    { id: 'singer', header: '歌手', width: 100 },
    { id: 'note', header: '備考' }
  ])
  table.onPageAdded((tbl: any) => tbl.addHeader())
  table.addBody(Object.keys(scores).map(key => scores[key]).sort((a,b) => {
    const addressA = a.address
    const addressB = b.address
    if (addressA < addressB) return -1
    if (addressA > addressB) return 1
    const nameA = a.name
    const nameB = b.name
    if (nameA < nameB) return -1
    if (nameA > nameB) return 1
    return 0
  }))

  const { start, count } = pdf.bufferedPageRange()
  const date = new Date()
  for (let i = start, end = start + count; i < end; i++) {
    pdf.switchToPage(i)
    pdf.text(title, 30, 20)
    pdf.text(`${date.toLocaleDateString('jp')}`, pdf.page.width - 100, 20)
    pdf.text(`${i+1}/${count}`, pdf.page.width - 100, 30)
  }
  pdf.pipe(res)
  pdf.end()
})

// Firestoreの変更（楽譜の追加・編集）検知
exports.updateBackup = functions.firestore.document('scores/{scoreId}').onWrite(async (change, context) => {
  try {
    // 出版社と保管場所は参照で保存してるので参照を解決する
    const publishers: IStringKeyValue = await getPublishers()
    const addresses: IStringKeyValue = await getAddresses()

    let score: IScore|null = null
    const data = change.after.data()
    if (typeof data !== 'undefined') {  // onDeleteでない
      const address = addresses[data.address.id]
      let year,publisher
      if (address === '課題曲') {
        year = data.year
      } else {
        publisher = publishers[data.publisher.id]
      }
      score = {
        name: data.name,
        otherName: data.otherName,
        address: address,
        year: year,
        publisher: publisher,
        singer: data.singer,
        note: data.note
      }
      // remove undefined value
      Object.keys(score).forEach(key => score && score[key] === undefined && delete score[key])
    }
    // write changes to database
    await database.ref('scores').child(context.params.scoreId).set(score)

    const snap = await database.ref('scores').once('value')
    const scores: IScoreList = snap.val() || {}
    await backup(scores, { database: false, storage: true })
  } catch (err) {
    console.error(err)
  }
})