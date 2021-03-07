const fireAdmin = require('firebase-admin');

const serviceAcc = require('./admin-key.json');
fireAdmin.initializeApp({
    credential: fireAdmin.credential.cert(serviceAcc)
});

module.exports = fireAdmin;