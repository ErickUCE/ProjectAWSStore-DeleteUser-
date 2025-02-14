const axios = require('axios');
const User = require('../models/user');

const resolvers = {
    Mutation: {
        deleteUser: async (_, { id }) => {
            try {
                const user = await User.findByPk(id);
                if (!user) throw new Error(`User with ID ${id} not found`);

                await user.destroy();
                console.log(`✅ User con ID ${id} eliminado en la base de Delete`);

                // ✅ Notificar a los otros microservicios para sincronización
                const instances = [
                    'http://3.208.235.135:5005/sync-delete', // Microservicio de Crear
                    'http://98.85.148.204:5007/sync-delete',  // Microservicio de Editar
                    'http://3.224.31.24:5006/sync-delete'  // Microservicio de Leer
                ];

                for (const instance of instances) {
                    try {
                        await axios.post(instance, { id });
                        console.log(`✅ Notificación enviada a ${instance} para sincronizar eliminación`);
                    } catch (error) {
                        console.error(`❌ Error notificando a ${instance}:`, error.message);
                    }
                }

                return `User with ID ${id} deleted`;
            } catch (error) {
                console.error('❌ Error eliminando usuario:', error);
                throw new Error('Failed to delete user');
            }
        }
    }
};

module.exports = resolvers;
