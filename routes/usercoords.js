const UserCoords = require('../db').models.user_coords;
const express = require('express');
const jwtVerify = require('../middlewares/jwt-verify');
const router = express.Router();


router.post("/", jwtVerify, async (req, resp) => {
    const coords = req.body;
    await UserCoords.create({
        user_id: coords.user_id,
        longitude: coords.longitude,
        latitude: coords.latitude
    });
    resp.send({
        status: 200,
        message: "Coords added"
    });
})

module.exports = router;