const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('chats', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    logo_path: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    is_private: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    allow_write_only_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    creator_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'chats',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "chats_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "fk_chat_creator_user",
        fields: [
          {
            name: "creator_id"
          }
        ]
      }
    ]
  });
};
