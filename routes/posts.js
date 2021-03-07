const express = require('express');
const jwtVerify = require('../middlewares/jwt-verify');
const Post = require('../db').models.posts;
const router = express.Router();

router.get("/", jwtVerify, async (req, resp) => {
    resp.json(await Post.findAll());
});

module.exports = router;