const express = require('express');
const jwtVerify = require('../middlewares/jwt-verify');
const roleVerify = require('../middlewares/role-verify');
const router = express.Router();
const models = require("../db").models;
const multer = require("multer");

const diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./images/chats")
    },
    filename: function (req, file, cb) {
        const unique = Date.now() + "-" + file.originalname;
        cb(null, unique);
    }
});

const fileUpload = multer({storage: diskStorage});

router.get("/:chatId", jwtVerify, async (req, resp) => {

    const chatId = req.params["chatId"];


    const chat = await models.chats.findByPk(chatId, {
        include: [models.users]
    });


    resp.json(chat);
});

router.post("/groupChat",
    jwtVerify,
    roleVerify(1),
    fileUpload.single("logo"),
    async (req, resp) => {

    const body = JSON.parse(req.body.chat);

    const existingNames = await models.chats.findAll({
        where: {
            name: body.name
        }
    });

    if(existingNames.length > 0) {
        resp.status(403)
            .json({
               status: 403,
                message: "Chat with this name already exists"
            });
        return;
    }

    const chat = await models.chats.create({
        name: body.name,
        logo_path: req.file.filename,
        is_private: false,
        allow_write_only_admin: body.allow_write_only_admin,
        creator_id: body.creator_id
    });

    for(user_id of body.users_in_chat) {
        await models.users_in_chat.create({
           chat_id: chat.id,
           user_id: user_id
        });
    }

    await models.messages.create({
        sender_id: req.payload.id,
        text: "Chat has been created",
        chat_id: chat.id
    });

    resp.json(chat);
});

router.delete("/:chatId", jwtVerify, roleVerify(1), async (req, resp) => {

    const chatId = req.params["chatId"];
    const chat = await models.chats.findByPk(chatId);

    await chat.destroy();

    resp.json({
        status: 200,
        message: "Chat has been deleted"
    });

});

router.put("/groupChat",
    jwtVerify,
    fileUpload.array("logo", 1),
    async (req, resp) => {

        const body = JSON.parse(req.body.chat);

        const existingNames = await models.chats.findAll({
            where: {
                name: body.name
            }
        });

        if(existingNames.length > 0 && existingNames[0].id != body.id) {
            resp.status(403)
                .json({
                    status: 403,
                    message: "Chat with this name already exists"
                });
            return;
        }

        const chat = await models.chats.findByPk(body.id);

        chat.name = body.name;
        chat.allow_write_only_admin = body.allow_write_only_admin;

        if (req.files.length === 1) {
            chat.logo_path = req.files[0].filename;
        }

        await chat.save();

        const usersInChat = await models.users_in_chat.findAll({
            where: {
                chat_id: chat.id
            }
        });


        for (let i = 0; i < body.users_in_chat.length; ++i) {

            const found = usersInChat.find(element =>
                element.user_id == body.users_in_chat[i]);

            if (found === undefined) {
                await models.users_in_chat.create({
                    user_id: body.users_in_chat[i],
                    chat_id: chat.id
                });
            }
        }

        for (let i = 0; i < usersInChat.length; ++i) {

            const found = body.users_in_chat.find(element => element == usersInChat[i].user_id);

            if (found === undefined) {
                await usersInChat[i].destroy();
            }
        }

        resp.json(chat);
    });

router.post("/privateChat", jwtVerify, async (req, resp) => {

    const body = req.body;

    const chats = await models.chats.findAll({
        where: {
            is_private: true
        }
    });


    for(let i = 0; i < chats.length; ++i) {
        const users = await chats[i].getUsers();
        if(users.length < 2) {
            continue;
        }
        if(users[0].id == body.receiver_id &&
            users[1].id == body.sender_id) {
            resp.json(chats[i]);
            return;
        }
        else if(users[0].id == body.sender_id &&
            users[1].id == body.receiver_id) {
            resp.json(chats[i]);
            return;
        }
    }

    const sender = await models.users.findByPk(body.sender_id);
    const receiver = await models.users.findByPk(body.receiver_id);

    const chat = await models.chats.create({
        name: "private chat " + sender.id + receiver.id,
        isPrivate: true,
        creator_id: body.sender_id
    });

    await models.users_in_chat.create({
        chat_id: chat.id,
        user_id: sender.id
    });

    await models.users_in_chat.create({
        chat_id: chat.id,
        user_id: receiver.id
    });

    resp.json(chat);
});


module.exports = router;