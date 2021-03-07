const express = require('express')
const app = express();
const path = require('path');
const readDir = require("./utils/read-dir");
const jwtVerify = require('./middlewares/jwt-verify');
const ws = require('./web-socket/index');
const dbListener = require('./db/db-listeners');
const User = require('./db').models.users;
const Chat = require('./db').models.chats;
const fireAdmin = require("./fire-app");

app.use(express.json());
app.use("/static/news", jwtVerify, express.static("images/news"));
app.use("/static/employers", jwtVerify, express.static("images/employers"));
app.use("/static/logos", jwtVerify, express.static("images/chats"));
app.use("/static/files", express.static("files"));

readDir(path.resolve('./routes'), (filename) => {
    const fileInfo = path.parse(filename);
    app.use(`/${fileInfo.name}`, require(`./routes/${filename}`));
    console.log(`Router ${fileInfo.name} registered`);
});

const httpServer = app.listen(8080, "192.168.88.211", () => {
    console.log("Server is started at port 8080");
});

ws.init(httpServer);

const work_longitude = 56.9066613;
const work_latitude = 24.0961026;

dbListener.on("new_user_coords", async (coords) => {
    
    console.log(coords);

    const user = await User.findByPk(coords.user_id);

    if(coords.latitude == work_latitude && coords.longitude == work_longitude) {
        user.status_id = 1;
    }
    else {
        user.status_id = 2;
    }

    await user.save();
});


dbListener.on("new_message", async (message) => {

    const chat = await Chat.findByPk(message.chat_id, {
        include: [User]
    });

    try {
        for (receiver of chat.users) {

            if (receiver.id == message.sender_id) {
                continue;
            }

            if (receiver.fms_token) {
                const notification = {
                    notification: {
                        title: "New message",
                        body: message.text
                    },
                    token: receiver.fms_token
                };

                await fireAdmin.messaging().send(notification);

                console.log("Notification sended!");
            }
        }
    }
    catch (ex) {
        console.log(ex);
    }
});