'use strict';

let crypto = require('crypto');

let config = {
  digestAlgorithm: 'sha1',
  keyLen: 64,
  saltSize: 64,
  iterations: 15000
};

function hashPassword(password, callback) {
  crypto.randomBytes(config.saltSize, (err, salt) => {
    if (err) {
      callback(err);
    }
    let combinedSalt = `${config.iterations}.${new Buffer(salt).toString('base64')}`;
    crypto.pbkdf2(Buffer.from(password, 'utf8'), Buffer.from(combinedSalt, 'utf8'), config.iterations, config.keyLen, config.digestAlgorithm,
      (err, hash) => {

        if (err) {
          callback(err);
        }

        let cipherText = new Buffer(hash).toString('base64');
        callback(null, cipherText, combinedSalt);
      });
  });
}

function verifyPassword(password, cipherText, saltParam) {
  return new Promise((resolve, reject) => {
    let iterations = parseInt(saltParam.split('.')[0]);
    let saltBuf = Buffer.from(saltParam, 'utf8');
    let cipher = Buffer.from(cipherText, 'base64');
    crypto.pbkdf2(Buffer.from(password, 'utf8'), saltBuf, iterations, config.keyLen, config.digestAlgorithm, (err, verify) => {
      if(err){
        reject(err);
      }else{
        let isValidPassword = verify.toString('base64') === cipher.toString('base64');
        resolve(isValidPassword);
      }
    });
  });
}


module.exports = {
  hashPassword: hashPassword,
  verifyPassword: verifyPassword
};