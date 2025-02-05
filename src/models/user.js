const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ✅ Verificar que `sequelize` se ha importado correctamente
console.log("📌 Verificando Sequelize en user.js:", typeof sequelize, Object.keys(sequelize));

const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    first_name: { type: DataTypes.STRING, allowNull: false },
    last_name: { type: DataTypes.STRING, allowNull: false },
    identification_number: { type: DataTypes.STRING, unique: true, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false, validate: { isEmail: true } },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    phone_number: { type: DataTypes.STRING, allowNull: false }
}, { 
    freezeTableName: true, 
    timestamps: false
});

module.exports = User;
