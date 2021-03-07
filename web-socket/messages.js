const WebSocket = require('ws');
const User = require("../db").models.users;
const Message = require('../db').models.messages;
const MessageAttachment = require('../db').models.message_attachments;
const Chat = require("../db").models.chats;
const ws = new WebSocket.Server({noServer: true});
const Op = require('sequelize').Op;
const dbListener = require('../db/db-listeners');
const moment = require('moment');

ws.on("connection", (socket) => {
    socket.on('message', async (data) => {
        const init = JSON.parse(data);
        if(init.type == 'init') {
            console.log("init received!");
            socket.chat_id = init.chat_id;
            socket.user_id = init.user_id;
            socket.send(JSON.stringify(
                await getMessages(init.chat_id, init.user_id)));
        }
        
    })
})

dbListener.on('new_message', async (data) => {
    var isLoaded = false;
    var dataJson = '';
    console.log("New Message");
    for(const client of ws.clients) {
        console.log(client.chat_id);
        if(client.chat_id == data.chat_id) {
            if(!isLoaded) {
                await loadAttachments(data);
                data.timestamp = moment(data.timestamp)
                 .format('YYYY-MM-DDTHH:mm:ss');
                dataJson = JSON.stringify([data]);
                isLoaded = true;
            }

            if(client.user_id != data.sender_id &&
                data.first_read_timestamp === null) {
                const message = await Message.findByPk(data.id);
                let now = moment.now();
                data.first_read_timestamp = now;
                message.first_read_timestamp = now;
                await message.save();
            }

            client.send(dataJson);
        }
    }
});


async function loadAttachments(message) {
    message.message_attachments = await MessageAttachment.findAll({
        where: {
            message_id: message.id
        }
    });
}

async function getMessages(chatId, userId) {

    const messages = await Message.findAll({
        where: {
            chat_id: chatId
        },
        include: [{ as: "sender", model: User}, MessageAttachment]
    });

    const chat = await Chat.findByPk(chatId);

    const result = []

    for(let i = 0; i < messages.length; ++i) {

        if(messages[i].sender_id != userId &&
            messages[i].first_read_timestamp === null) {
            messages[i].first_read_timestamp = moment.now();
            await messages[i].save();
        }

        const m = messages[i];

        result.push({
            id: m.id,
            sender_id: m.sender_id,
            chat_id: m.chat_id,
            text: m.text,
            sender: m.sender,
            timestamp: moment(m.timestamp)
                .format('YYYY-MM-DDTHH:mm:ss'),
            message_attachments: m.message_attachments,
            chat: chat,
            first_read_timestamp: m.first_read_timestamp
        })
    }

    return result;
}

module.exports = ws;