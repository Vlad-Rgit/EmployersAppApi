const Sequelize = require('sequelize')
const initModels = require('./models/init-models')

const sequelize = new Sequelize('employers', 'user', 'cortik228', {
    host: 'localhost',
    dialect: 'postgres',
    timezone: 'utc'
});

module.exports.models = initModels(sequelize);
module.exports.db = sequelize;