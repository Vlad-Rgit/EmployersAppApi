const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('news_files', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    news_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'news',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'news_files',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "fki_fk_news_file_news",
        fields: [
          { name: "news_id" },
        ]
      },
      {
        name: "news_files_pkey",
        unique: true,
        fields: [
          { name: "name" },
        ]
      },
    ]
  });
};
