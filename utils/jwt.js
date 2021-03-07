const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt-config');

module.exports.signUser = function(user) {

    const payload = {
        id: user.id,
        roleId: user.role_id
    }

    return jwt.sign(
        payload,
        jwtConfig.secret
    );
}

module.exports.verify = function(token, callback) {
    jwt.verify(
        token,
        jwtConfig.secret,
        callback
    );
}