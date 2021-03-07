const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_coords', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('now'),
      primaryKey: true
    },
    latitude: {
      type: DataTypes.REAL,
      allowNull: false
    },
    longitude: {
      type: DataTypes.REAL,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'user_coords',
    schema: 'public',
    hasTrigger: true,
    timestamps: false,
    indexes: [
      {
        name: "user_coords_pkey",
        unique: true,
        fields: [
          { name: "user_id" },
          { name: "timestamp" },
        ]
      },
    ]
  });
};
