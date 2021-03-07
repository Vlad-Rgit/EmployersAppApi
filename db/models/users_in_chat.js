const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users_in_chat', {
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    chat_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'chats',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'users_in_chat',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "users_in_chat_pkey",
        unique: true,
        fields: [
          { name: "user_id" },
          { name: "chat_id" },
        ]
      },
    ]
  });
};
