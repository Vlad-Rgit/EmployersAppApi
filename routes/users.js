const express = require('express');
const users = require('../db').models.users;
const posts = require('../db').models.posts;
const statuses = require('../db').models.statuses;
const db = require('../db').db;
const router = express.Router();
const jwt = require('../utils/jwt');
const jwtVerify = require('../middlewares/jwt-verify');
const Sequelize = require('sequelize');
const roleVerify = require('../middlewares/role-verify');
const crypto = require('crypto');
const hashUtil = require('../utils/hash');


router.get("/", jwtVerify, async (req, resp) => {
    try {
        const result = await users.findAll({
            attributes: {
                exclude: ['password_hash']
            },
            include: [posts, statuses]
        });
        resp.json(result);
    }
    catch(error) {
        console.log(error);
        resp
            .status(500)
            .json({
                message: "Internal server error",
                status: 500
            });
    }
});

router.get("/:userId", jwtVerify, async (req, resp) => {
    const userId = req.params["userId"];
    const user = await users.findOne({
        exclude: ["password_hash"],
        where: {
            id: req.params["userId"]
        },
        include: [posts, statuses]
    })
    if(user === null) {
        resp.status(404)
            .json({
                status: 404,
                message: `User with id ${userId} does not exist`
            });
    }
    else {
        resp.json(user);
    }
});



router.post("/fms-token/:userId", jwtVerify, async (req, resp) => {

    const token = req.query.token;
    const userId = req.params["userId"];

    await db.query(`Update users set fms_token = '${token}' where id = ${userId}`,
         Sequelize.QueryTypes.UPDATE);

    resp.status(200)
        .json({
            status: 200,
            message: "Token updated"
        });
}); 

router.put("/:userId/:statusId", jwtVerify, async (req, resp) => {
    const userId = req.params["userId"];
    const statusId = req.params["statusId"];
    const user = await users.findByPk(userId);
    user.is_location_public = statusId == 1 ? true : false;
    await user.save();
    resp.send({
        status: 200,
        messgae: "updated"
    });
});

router.post("/login", async (req, resp) => {

    const claimUser = req.body;


    const allUsers = await users.findAll();

    for(const user of allUsers) {
        try {
            
            if(user.salt == null || user.password_hash == null)
                continue;

            const isValid = await hashUtil.verifyPassword(
                claimUser.password,
                user.password_hash,
                user.salt
            );
            if(isValid === true) {
                const token = jwt.signUser(user);
                resp.json({token: token, user: user});
                return;
            }
        }
        catch(err) {
            console.log(err);
            resp
            .status(500)
            .json({
                message: "Server Error",
                status: 500
            });
            return;
        }
    }

    resp
        .status(401)
        .json({
            message: "Error credentials",
            status: 401
        });
});


module.exports = router;