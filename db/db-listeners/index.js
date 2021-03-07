const pg = require('pg');
const EventEmitter = require('events');
const util = require('util');


function DbEventEmitter() {
    EventEmitter.call(this);
}

util.inherits(DbEventEmitter, EventEmitter);
const dbListener = new DbEventEmitter;

const config = {
    user: 'user',
    password: "cortik228",
    host: 'localhost',
    port: 5432,
    database: 'employers'
}

const client = new pg.Client(config);
client.connect();

client.on("notification", function(msg) {
    const payload = JSON.parse(msg.payload);
    dbListener.emit(msg.channel, payload);
})


client.query("LISTEN new_user_coords")
    .then(() => console.log("Listening new_user_coords"));

    
client.query("LISTEN update_user")
    .then(() => console.log("Listening update_user"));

client.query("LISTEN new_message")
    .then(() => console.log("Listening new_message"));

module.exports = dbListener;




