const express = require('express');
const jwtVerify = require('../middlewares/jwt-verify');
const roleVerify = require('../middlewares/role-verify');
const router = express.Router();
const news = require('../db').models.news;
const users = require('../db').models.users;
const newsPhotos = require('../db').models.news_photos;
const newsFiles = require('../db').models.news_files;
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const util = require('util');

const writeFile = util.promisify(fs.writeFile);

const diskStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        if(file.fieldname == "images") {
            cb(null, "./images/news");
        }
        else {
            cb(null, "./files/news");
        }
    },
    filename: function(req, file, cb) {
        const unique = Date.now() + "-";
        cb(null, unique + file.originalname);
    }
})

const fileUpload = multer({storage: diskStorage});

router.get("/", jwtVerify, async (req, resp) => {
    resp.json(await news.findAll({
        order: [["created_at", "DESC"]],
        include: [newsPhotos, newsFiles, users]
    }));
});

router.put("/",
    jwtVerify,
    roleVerify(1),
    fileUpload.fields([{name: "images"}, {name: "files"}]),
    async (req, resp) => {

        const editedNews = JSON.parse(req.body.news);
    
        if(req.files.files) {
            for(const file of req.files.files) {
                await newsFiles.create({
                    name: file.filename,
                    news_id: editedNews.id
                });
            };
        }

        if(req.files.images) {
            for(const file of req.files.images) {
            await newsPhotos.create({
                    name: file.filename,
                    news_id: editedNews.id
                });
            }
        }

        const existedNews = await news.findByPk(editedNews.id);
        existedNews.text = editedNews.text;
        existedNews.title = editedNews.title;
        existedNews.user_id = editedNews.user_id;

        await existedNews.save();

        resp.status(200)
            .send(existedNews);
    }
)

router.delete("/file/:id",
    jwtVerify,
    roleVerify(1),
    async (req, resp) => {
        const file = await newsFiles.findByPk(req.params["id"]);
        await file.destroy();
        resp.status(200)
            .json({
                status: 200,
                message: "News File deleted"
            });
    }
)

router.delete("/photo/:id",
    jwtVerify,
    roleVerify(1),
    async (req, resp) => {
        const phot = await newsPhotos.findByPk(req.params["id"]);
        await phot.destroy();
        resp.status(200)
            .json({
                status: 200,
                message: "News Photo deleted"
            });
    }
)

router.delete("/:newsId",
        jwtVerify,
        roleVerify(1),
        async (req, resp) => {

            const newsId = req.params["newsId"];
            const toDelete = await news.findByPk(newsId);
            await toDelete.destroy();

            resp.status(200)
                .json({
                    status: 200,
                    message: "News has been deleted"
                });
        }
)

router.post("/",
            jwtVerify, 
            roleVerify(1),
            fileUpload.fields([{name: "images"}, {name: "files"}]),
            async (req, resp) => {

                var newNews = JSON.parse(req.body.news);
                newNews = await news.create({
                    text: newNews.text,
                    title: newNews.title,
                    user_id: newNews.user_id
                });

                if(req.files.files) {
                    for(const file of req.files.files) {
                        await newsFiles.create({
                            name: file.filename,
                            news_id: newNews.id
                        });
                    };
                }

                if(req.files.images) {
                    for(const file of req.files.images) {
                    await newsPhotos.create({
                            name: file.filename,
                            news_id: newNews.id
                        });
                    }
                }

                resp.status(200)
                    .send(newNews);
            });

router.get("/images/:newsId", jwtVerify, async (req, resp) => {

    const newsId = req.params["newsId"];

    const images = await newsPhotos.findAll(
        {
            attributes: ['name'],
            where: {
                news_id: newsId
            }
        }
    )

    resp.json(images);
})

module.exports = router;