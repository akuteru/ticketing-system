import firebase from "firebase"
const firebaseConfig = {
    apiKey: "AIzaSyAUNiS4jm1J9Z4-x0HGT8i0KFYbs9rJ0zo",
    authDomain: "onlinechatsystem-9d3bf.firebaseapp.com",
    projectId: "onlinechatsystem-9d3bf",
    storageBucket: "gs://onlinechatsystem-9d3bf.appspot.com",
    messagingSenderId: "564815915603",
    appId: "1:564815915603:web:b1cafd24de14a5f56e34a6"
};

firebase.initializeApp(firebaseConfig);
firebase
    .firestore()
    .enablePersistence({synchronizeTabs : !0})
    .catch(() => {
        console.warn("DB Offline support not available");
    })
export default {
    firestore: firebase.firestore(),
    auth: firebase.auth(),
    storage: firebase.storage(),
    persistence: firebase.auth.Auth.Persistence,
    fieldValue: firebase.firestore.FieldValue,
    taskEvent: firebase.storage.TaskEvent,
    taskState: firebase.storage.TaskState
}
