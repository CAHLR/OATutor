import firebase from 'firebase';
import config from './credentials.js';

class Firebase {

  constructor() {
    firebase.initializeApp(config);
    this.db = firebase.firestore();
    this.db.settings({
      timestampsInSnapshots: true
    });
  }

  /*
    Collection: Collection of Key/Value pairs 
    Document: Key - How you will access this data later. Usually username
    Data: Value - JSON object of data you want to store
  */
  writeData(collection, document, data) {
    try {
      this.db.collection(collection).doc(document).set(data);
      return 0;
    } catch (err) {
      return -1;
    }
  }

  /*
    Collection: Collection of Key/Value pairs
    Document: Key - How you plan to access this data
    cb: callback function since reading data is asynchronous
  */
  readData(collection, document, cb, req, res) {
    this.db.collection(collection).doc(document).get().then((doc) =>
      cb(req, res, doc.data())
    ).catch(err => {
      cb(req, res, undefined)
    });
  }
}
export default Firebase;

