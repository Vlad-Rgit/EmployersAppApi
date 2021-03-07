const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    last_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    login: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    password_hash: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    photo_path: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'posts',
        key: 'id'
      }
    },
    status_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'statuses',
        key: 'id'
      }
    },
    role_id: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 2,
      references: {
        model: 'roles',
        key: 'id'
      }
    },
    is_location_public: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    fms_token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    start_vacation_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    end_vacation_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    salt: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    vacation_comment: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'users',
    schema: 'public',
    hasTrigger: true,
    timestamps: false,
    indexes: [
      {
        name: "fki_fk_users_posts",
        fields: [
          { name: "post_id" },
        ]
      },
      {
        name: "fki_fk_users_roles",
        fields: [
          { name: "role_id" },
        ]
      },
      {
        name: "fki_fk_users_statuses",
        fields: [
          { name: "status_id" },
        ]
      },
      {
        name: "users_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
