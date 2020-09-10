// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app"
// Add the Firebase products that you want to use
import "firebase/auth"
import "firebase/firestore"
import "firebase/analytics"

const firebaseConfig = {
  apiKey: "AIzaSyDWETpArGNX_ga7Su-K3JjNrOGkT78DxRA",
  authDomain: "nwoc-sm.firebaseapp.com",
  databaseURL: "https://nwoc-sm.firebaseio.com",
  projectId: "nwoc-sm",
  storageBucket: "nwoc-sm.appspot.com",
  messagingSenderId: "275447746757",
  appId: "1:275447746757:web:94265bb649f03309eea0ac",
  measurementId: "G-DSV75VNM3F"
}
firebase.initializeApp(firebaseConfig)

export const analytics = firebase.analytics()
export const firestore = firebase.firestore()
export const auth = firebase.auth()

if (process.env.NODE_ENV === 'production') {
  analytics.logEvent('page_view', {})
}
