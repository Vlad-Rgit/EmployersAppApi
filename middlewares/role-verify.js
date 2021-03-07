const e = require("express");

/**
 * @param {number} roleId 
 */
module.exports = function(roleId) {
    return function(req, resp, next) {
        console.log(req.payload);
        if(req.payload.roleId == roleId) {
            next();
        }
        else {
            resp.status(401)
                .json({
                    status: 401,
                    message: "Not authorized"
                });
        }
    }
}