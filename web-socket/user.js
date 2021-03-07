const WebSocket = require('ws');
const dbListener = require('../db/db-listeners');

const User = require('../db').models.users;
const Post = require('../db').models.posts;
const Status = require('../db').models.statuses;

const ws = new WebSocket.Server({noServer: true});

ws.on('connection', (socket) => {
    console.log("Connected!");
    socket.on('message', async (data) => {
        const params = JSON.parse(data);
        console.log(params);
        if(params.type === "init") {
            socket.userId = params.user_id;
            const user = await User.findByPk(params.user_id, {
                include: [Status, Post]
            });
            socket.send(JSON.stringify(user));
        }
    })
})

dbListener.on('update_user', async (user) => {
    var isLoaded = false;
    var userJson = "";
    for(const client of ws.clients) {
        if(client.userId == user.id) {
            if(!isLoaded) {
                await loadUserAssotiasons(user);
                userJson = JSON.stringify(user);
                isLoaded = true;
            }
            console.log(userJson);
            client.send(userJson);
        }
    }
});

async function loadUserAssotiasons(user) {
    user.post = await Post.findOne({
        where: {
            id: user.post_id
        }
    });

    user.status = await Status.findOne({
        where: {
            id: user.status_id
        }
    });
}

module.exports = ws;