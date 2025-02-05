const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Verificar que se están usando las IPs correctas
console.log("Conectando a Crear en:", process.env.DB_HOST_CREATE);
console.log("Conectando a Delete en:", process.env.DB_HOST_DELETE);

// Conexión a la base de datos del microservicio de Crear
const createDB = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST_CREATE, // ⚠️ Revisar si es la IP correcta
    dialect: 'mysql',
    logging: false,
});

// Conexión a la base de datos del microservicio de Read
const deleteDB = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST_DELETE, // ⚠️ Revisar si es la IP correcta
    dialect: 'mysql',
    logging: false,
});

// Modelo de User
const UserModel = (sequelize) =>
    sequelize.define('User', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        first_name: { type: DataTypes.STRING, allowNull: false },
        last_name: { type: DataTypes.STRING, allowNull: false },
        identification_number: { type: DataTypes.STRING, unique: true, allowNull: false },
        email: { type: DataTypes.STRING, unique: true, allowNull: false, validate: { isEmail: true } },
        password_hash: { type: DataTypes.STRING, allowNull: false },
        phone_number: { type: DataTypes.STRING, allowNull: false }
    }, { 
        freezeTableName: true, 
        timestamps: false // ✅ Sequelize manejará las fechas pero no las agregaremos en GraphQL
    });

// Instancias del modelo en cada base de datos
const UserInCreate = UserModel(createDB);
const UserInDelete = UserModel(deleteDB);

// Función de sincronización
async function syncTables() {
    try {
        await createDB.authenticate();
        await deleteDB.authenticate();
        console.log('✅ Conexión exitosa a ambas bases de datos');

        const usersInCreate = await UserInCreate.findAll();
        console.log(`🔄 Se encontraron ${usersInCreate.length} users en Crear`);

        for (const user of usersInCreate) {
            const existingUser = await UserInDelete.findByPk(user.id);
            if (!existingUser) {
                await UserInDelete.create(user.toJSON());
                console.log(`✅ User con ID ${user.id} sincronizado en Eliminar`);
            } else {
                console.log(`⚠️ User con ID ${user.id} ya existe en Eliminar`);
            }
        }

        console.log('✅ Sincronización completada');
    } catch (error) {
        console.error('❌ Error sincronizando las tablas:', error);
    } finally {
        await createDB.close();
        await deleteDB.close();
    }
}

syncTables();
