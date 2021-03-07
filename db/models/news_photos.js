const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('news_photos', {
    name: {
      type: DataTypes.STRING(200),
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
    tableName: 'news_photos',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "fki_fk_news_photo_news",
        fields: [
          { name: "news_id" },
        ]
      },
      {
        name: "news_photos_pkey",
        unique: true,
        fields: [
          { name: "name" },
        ]
      },
    ]
  });
};
