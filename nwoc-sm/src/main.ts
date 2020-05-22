import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import vuetify from './plugins/vuetify'

// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app";
// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/firestore";
// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyDWETpArGNX_ga7Su-K3JjNrOGkT78DxRA",
  authDomain: "nwoc-sm.firebaseapp.com",
  databaseURL: "https://nwoc-sm.firebaseio.com",
  projectId: "nwoc-sm",
  storageBucket: "nwoc-sm.appspot.com",
  messagingSenderId: "275447746757",
  appId: "1:275447746757:web:94265bb649f03309eea0ac"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

Vue.config.productionTip = false

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
