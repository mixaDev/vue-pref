import firebase from 'firebase'

let firebaseConfig = {
  apiKey: 'AIzaSyASaRAzdCE4GmQQTb0KR_Qh6_F-Zv_qU8o',
  authDomain: 'pref-66168.firebaseapp.com',
  databaseURL: 'https://pref-66168.firebaseio.com',
  projectId: 'pref-66168',
  storageBucket: 'pref-66168.appspot.com',
  messagingSenderId: '319089914184'
}

let database = null

const init = function () {
  firebase.initializeApp(firebaseConfig)
  database = firebase.database()
}

const getRef = function (path) {
  if (!database) {
    init()
  }
  return database.ref(path)
}

const getDb = function () {
  return database
}

export default { init, getRef, getDb }
