const express = require('express');
const jwtVerify = require('../middlewares/jwt-verify');
const Message = require('../db').models.messages;
const MessageAttachment = require('../db').models.message_attachments;
const Chat = require("../db").models.chats;
const User = require('../db').models.users;
const UserInChat = require('../db').models.users_in_chat;
const router = express.Router();
const Sequelize = require('sequelize');
const db = require('../db').db;
const moment = require('moment');
const Op = Sequelize.Op;
const multer = require('multer');


const diskStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "./files/messages");
    },
    filename: function(req, file, cb) {
        const unique = Date.now() + "-";
        cb(null, unique + file.originalname);
    }
});

const fileUpload = multer({storage: diskStorage});


router.post("/chat/private", jwtVerify, async (req, resp) => {

})

router.get("/chat/:id", jwtVerify, async (req, resp) => {

    const chatId = req.params["id"];

    const messages = await Message.findAll({
        where: {
            chat_id: chatId
        },
        include: [Chat, { model: User, as: "sender"}]
    });

    resp.json(messages);
});

router.get("/:receiverId", jwtVerify, async (req, resp) => {

    const userId = req.params["receiverId"];

    const messages = await db.query(`select distinct on (ch.id)
                                         ch.id,
                                         ch.name,
                                         ch.logo_path,
                                         ch.is_private as is_in_private_chat,
                                         ms.sender_id,
                                         sender.first_name as sender_first_name,
                                         sender.last_name as sender_last_name,
                                         sender.photo_path as sender_photo_path,
                                         ms.text,
                                         ms.timestamp
                                     from chats ch
                                         inner join users_in_chat uc
                                            on uc.chat_id = ch.id and uc.user_id = ${userId}
                                         inner join messages ms on ch.id = ms.chat_id
                                         inner join users sender on sender.id = ms.sender_id
                                     order by ch.id, ms.timestamp desc`, {
        type: Sequelize.QueryTypes.SELECT,
        nest: true
    });


    for(const message of messages) {

        message.timestamp = moment(message.timestamp)
            .format('YYYY-MM-DDTHH:mm:ss');

        const usersInChat = await UserInChat.findAll({
            where: {
                chat_id: message.id
            },
            include: [User]
        });

        if(message.is_in_private_chat) {

            var user;

            if (usersInChat[0].user.id != message.sender_id) {
                user = usersInChat[0].user;
            } else {
                user = usersInChat[1].user;
            }

            message.receiver_id = user.id;
            message.receiver_first_name = user.first_name;
            message.receiver_last_name = user.last_name;
            message.receiver_photo_path = user.photo_path;
        }
    }


    resp.json(messages);
});

router.get("/", jwtVerify, async (req, resp) => {

    const firstUserId = req.query.firstUserId;
    const secondUserId = req.query.secondUserId;

    if(req.payload.id != firstUserId && req.payload.id != secondUserId) {
        resp.status(401)
            .json({
                status: 401,
                message: "Unathorized"
            });
        return;
    }

    const messages = await Message.findAll({
        where: {
            [Op.or]: [{
                [Op.and]: [
                    {sender_id: firstUserId},
                    {receiver_id: secondUserId}
                ]
            },
            {
                [Op.and]: [
                    {sender_id: secondUserId},
                    {receiver_id: firstUserId}
                ]
            }]
        },
        include: [MessageAttachment]
    });

    resp.json(messages);
});

router.post("/", jwtVerify, fileUpload.array("files"), async (req, resp) => {

    const body = JSON.parse(req.body.message);

    db.transaction(async (t) => {
        
        const message = await Message.create({
            sender_id: body.sender_id,
            chat_id: body.chat_id,
            text: body.text
        }, {transaction: t});

        for(const file of req.files) {
            await MessageAttachment.create({
                name: file.filename,
                message_id: message.id
            }, {transaction: t});
        };
    
    });

    resp.status(200)
        .json({
            status: 200,
            message: "Message added"
        });
});


module.exports = router;