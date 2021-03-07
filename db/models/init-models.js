var DataTypes = require("sequelize").DataTypes;
var _chats = require("./chats");
var _message_attachments = require("./message_attachments");
var _messages = require("./messages");
var _news = require("./news");
var _news_files = require("./news_files");
var _news_photos = require("./news_photos");
var _posts = require("./posts");
var _roles = require("./roles");
var _statuses = require("./statuses");
var _user_coords = require("./user_coords");
var _users = require("./users");
var _users_in_chat = require("./users_in_chat");

function initModels(sequelize) {
  var chats = _chats(sequelize, DataTypes);
  var message_attachments = _message_attachments(sequelize, DataTypes);
  var messages = _messages(sequelize, DataTypes);
  var news = _news(sequelize, DataTypes);
  var news_files = _news_files(sequelize, DataTypes);
  var news_photos = _news_photos(sequelize, DataTypes);
  var posts = _posts(sequelize, DataTypes);
  var roles = _roles(sequelize, DataTypes);
  var statuses = _statuses(sequelize, DataTypes);
  var user_coords = _user_coords(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);
  var users_in_chat = _users_in_chat(sequelize, DataTypes);

  chats.belongsToMany(users, { through: users_in_chat, foreignKey: "chat_id", otherKey: "user_id" });
  users.belongsToMany(chats, { through: users_in_chat, foreignKey: "user_id", otherKey: "chat_id" });
  messages.belongsTo(chats, { foreignKey: "chat_id" });
  chats.hasMany(messages, { foreignKey: "chat_id"});
  chats.belongsTo(users, { foreignKey: "creator_id"});
  users_in_chat.belongsTo(chats, { foreignKey: "chat_id"});
  chats.hasMany(users_in_chat, { foreignKey: "chat_id"});
  message_attachments.belongsTo(messages, { foreignKey: "message_id"});
  messages.hasMany(message_attachments, { foreignKey: "message_id"});
  news_files.belongsTo(news, { foreignKey: "news_id"});
  news.hasMany(news_files, { foreignKey: "news_id"});
  news_photos.belongsTo(news, { foreignKey: "news_id"});
  news.hasMany(news_photos, {  foreignKey: "news_id"});
  users.belongsTo(posts, { foreignKey: "post_id"});
  posts.hasMany(users, { foreignKey: "post_id"});
  users.belongsTo(roles, { foreignKey: "role_id"});
  roles.hasMany(users, { foreignKey: "role_id"});
  users.belongsTo(statuses, {  foreignKey: "status_id"});
  statuses.hasMany(users, { foreignKey: "status_id"});
  messages.belongsTo(users, { foreignKey: "receiver_id"});
  users.hasMany(messages, {  foreignKey: "receiver_id"});
  messages.belongsTo(users, {  foreignKey: "sender_id", as: "sender"});
  users.hasMany(messages, { foreignKey: "sender_id"});
  news.belongsTo(users, {  foreignKey: "user_id"});
  users.hasMany(news, {  foreignKey: "user_id"});
  user_coords.belongsTo(users, {  foreignKey: "user_id"});
  users.hasMany(user_coords, { foreignKey: "user_id"});
  users_in_chat.belongsTo(users, {  foreignKey: "user_id"});
  users.hasMany(users_in_chat, { foreignKey: "user_id"});

  return {
    chats,
    message_attachments,
    messages,
    news,
    news_files,
    news_photos,
    posts,
    roles,
    statuses,
    user_coords,
    users,
    users_in_chat,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
