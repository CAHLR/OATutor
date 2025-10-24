// const config = {
//     apiKey: "[apikey]",
//     authDomain: "[projId].firebaseapp.com",
//     databaseURL: "https://[projId].firebaseio.com",
//     projectId: "[projId]",
//     storageBucket: "[projId].appspot.com",
//     messagingSenderId: "[messagingSenderId]",
//     appId: "[appId]",
//     measurementId: "[measurementId]",
// };

import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";

const config = JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG);

firebase.initializeApp(config);

export default firebase;
