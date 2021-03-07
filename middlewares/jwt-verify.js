const jwtConfig = require('../config/jwt-config');
const jwt = require('jsonwebtoken');


module.exports = function(req, resp, next) {

    if(req.headers.authorization) {

        const authHeader = req.headers.authorization.split(' ');

        if(authHeader[0] === 'Bearer') {
            jwt.verify(
                authHeader[1],
                jwtConfig.secret,
                (err, payload) => {
                    if(err) {
                        console.log(err);
                        resp.sendStatus(401);
                    }
                    else {
                        req.payload = payload;
                        next();
                    }
                }
            )
        }
        else {
            resp.sendStatus(401);
        }
    }
    else {
        resp.sendStatus(401);
    }
};