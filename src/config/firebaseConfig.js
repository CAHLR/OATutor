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


const config = JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG);

export default config;


// import firebase from "firebase/compat/app";
// import "firebase/compat/firestore";
// import "firebase/compat/auth";

// let config = {};
// try {
//   config = JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG);
// } catch (e) {
//   console.error("Firebase config parse failed. Make sure REACT_APP_FIREBASE_CONFIG is set correctly.", e);
// }

// if (!firebase.apps.length && Object.keys(config).length) {
//   firebase.initializeApp(config);
// }

// export default firebase;
