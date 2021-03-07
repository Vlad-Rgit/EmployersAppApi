const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('messages', {
    sender_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    receiver_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('now')
    },
    first_read_timestamp: {
      type: DataTypes.DATE,
      allowNull: true
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    chat_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'chats',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'messages',
    schema: 'public',
    hasTrigger: true,
    timestamps: false,
    indexes: [
      {
        name: "fki_fk_messages_chat",
        fields: [
          { name: "chat_id" },
        ]
      },
      {
        name: "fki_fk_messages_sender",
        fields: [
          { name: "sender_id" },
        ]
      },
      {
        name: "message_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "message_recevier",
        fields: [
          { name: "receiver_id" },
        ]
      },
    ]
  });
};
