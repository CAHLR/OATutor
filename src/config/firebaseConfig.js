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


const config = JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG || "{}");
export default config;


// import { initializeApp, getApps } from "firebase/app";

// let config = {};
// try {
//   config = JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG || "{}");
// } catch (err) {
//   console.error("Invalid Firebase config:", err);
// }

// let app;
// if (!getApps().length) {
//   app = initializeApp(config);
// }

// export default config;
// export { app };
