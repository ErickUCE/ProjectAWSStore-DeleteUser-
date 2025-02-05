require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST_DELETE, // ✅ Definir en .env
    dialect: 'mysql',
    logging: false
});

// ✅ Verificar que `sequelize` se ha configurado correctamente
console.log("📌 Verificando Sequelize en database.js:", typeof sequelize, Object.keys(sequelize));

sequelize.authenticate()
    .then(() => console.log('✅ Database connected successfully!'))
    .catch(err => console.error('❌ Database connection error:', err));

module.exports = sequelize;
