const express = require('express');
const users = require('../db').models.users;
const jwtVerify = require('../middlewares/jwt-verify');
const roleVerify = require('../middlewares/role-verify');
const fireAdmin = require("../fire-app");
const router = express.Router();



router.post("/", jwtVerify, roleVerify(1), async (req, resp) => {

    console.log(req.body);
    const body = req.body;

    const targetEmployer = await users.findByPk(body.target_employer_id);
    const fmsToken = targetEmployer.fms_token;

    if(fmsToken) {
        const fireDateTime = Date.parse(body.fire_date_time);
        const message = body.message;
        setTimeout(
            async () => {

                const notification = {
                    notification: {
                        title: "Notification from admin",
                        body: message
                    },
                    token: fmsToken
                };

                try {
                    await fireAdmin.messaging().send(notification);
                    console.log("Admin notification sent");
                }
                catch(err) {
                    console.log(err);
                }
            },
            fireDateTime - Date.now()
        )

        resp.status(200)
        .json({
            status: 200,
            message: "Notification is registered"
        });
    }
    else {
        resp.status(200)
            .json({
                status: 200,
                message: "Target Employer has no fms token"
            });
    }
});


module.exports = router;