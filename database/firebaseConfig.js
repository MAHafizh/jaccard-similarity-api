const admin = require('firebase-admin');
const serviceAccount = require('/etc/secrets/service_account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://jaccard-similarity-default-rtdb.asia-southeast1.firebasedatabase.app/'
});

const db = admin.database();

module.exports = db;
