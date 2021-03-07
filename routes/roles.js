const express = require('express');
const jwtVerify = require('../middlewares/jwt-verify');
const Role = require('../db').models.roles;
const router = express.Router();

router.get("/", jwtVerify, async (req, resp) => {
    resp.json(await Role.findAll());
});

module.exports = router;