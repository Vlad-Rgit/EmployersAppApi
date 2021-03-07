const express = require('express');
const users = require('../db').models.users;
const posts = require('../db').models.posts;
const statuses = require('../db').models.statuses;
const db = require('../db').db;
const jwt = require('../utils/jwt');
const jwtVerify = require('../middlewares/jwt-verify');
const Sequelize = require('sequelize');
const roleVerify = require('../middlewares/role-verify');
const multer = require('multer');
const hash = require('../utils/hash');

const diskStorage = multer.diskStorage({
    destination: function(req, file, cb) {

            cb(null, "./images/employers");
        
    },
    filename: function(req, file, cb) {
        const unique = Date.now() + "-";
        cb(null, unique + file.originalname);
    }
});

const fileUpload = multer({storage: diskStorage});

const router = express.Router();

router.post("/",
         jwtVerify, 
         fileUpload.single("photo"),
        async (req, resp) => {

            try {
            
                const body = JSON.parse(req.body.employer);

                const existingLogins = await users.findAll({
                    where: {
                        login: body.login
                    }
                });

                if(existingLogins.length > 0) {
                    resp.status(403)
                        .json({
                        status: 403,
                        message: "Employer with this login already exists"
                    });
                    return
                }

                hash.hashPassword(body.password, async (err, hash, salt) => {
                    if(err) {
                        console.log(err);

                        resp.status(500)
                            .send({
                                status: 500,
                                message: "Hash error"
                            });
                    }
                    else {
                        console.log(hash);
                        await users.create({
                            last_name: body.last_name,
                            first_name: body.first_name,
                            login: body.login,
                            password_hash: hash,
                            photo_path: req.file.filename,
                            post_id: body.post_id,
                            status_id: 2,
                            role_id: body.role_id,
                            is_location_public: true,
                            fms_token: null,
                            salt: salt
                        });

                        resp.status(200)
                            .send({
                                status: 200,
                                message: "Employer added"
                            });
                     }
    
                 
                })
            }
            catch(e) {
                console.log(e);
                resp.status(500)
                    .send({
                        status: 500,
                        message: e
                    });
            }
});


router.delete("/:id", jwtVerify, roleVerify(1), async (req, resp) => {
    try {
        const user = await users.findByPk(req.params["id"]);
        await user.destroy();
        resp.status(200)
            .send({
                status: 200,
                message: "Employer deleted"
            });
    }
    catch(e) {
        console.log(e);
        resp.status(500)
            .send({
            status: 500,
            message: e
        });
    }
});

router.put("/",
         jwtVerify, 
         fileUpload.array("photo"),
        async (req, resp) => {

            try {

                const body = JSON.parse(req.body.employer);

                const existingLogins = await users.findAll({
                    where: {
                        login: body.login
                    }
                });

                if(existingLogins.length > 0 && existingLogins[0].id != body.id) {
                    resp.status(403)
                        .json({
                            status: 403,
                            message: "Employer with this login already exists"
                        });
                    return
                }

                const user = await users.findByPk(body.id);
                console.log(body);
                user.last_name = body.last_name;
                user.first_name = body.first_name;
                user.login = body.login;
                if(body.password !== "") {
                    user.password_hash = body.password;
                }
                if(req.files.length > 0) {
                    user.photo_path = req.files[0].filename;
                }
                user.post_id = body.post_id;
                user.role_id = body.role_id;
                user.vacation_comment = body.vacation_comment;
                console.log(body.start_vacation_date);
                console.log(user);
                if(body.start_vacation_date) {
                    user.start_vacation_date = Date.parse(body.start_vacation_date);
                }
                if(body.end_vacation_date) {
                    user.end_vacation_date = Date.parse(body.end_vacation_date);
                }
                await user.save();
                  
                resp.status(200)
                    .send({
                        status: 200,
                        message: "Employer added"
                    });
            }
            catch(e) {
                console.log(e);
                resp.status(500)
                    .send({
                        status: 500,
                        message: e
                    });
            }

});


module.exports = router;