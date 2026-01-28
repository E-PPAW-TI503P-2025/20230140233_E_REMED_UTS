
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('library_geo_db', 'root', 'Msi15153', {
    host: 'localhost',
    dialect: 'mysql',
    port: 3307, 
    logging: false
});

module.exports = sequelize;