const express = require('express');
const User = require('../models/user');
const authenticateToken = require('../middlewares/authMiddleware'); // ✅ Middleware para verificar token

const router = express.Router();

const axios = require('axios');

// 🔥 Sincronizar eliminación con los otros microservicios
const instances = [
    'http://127.0.0.1:5005/sync-delete', // Microservicio de Crear
                    'http://127.0.0.1:5007/sync-delete',  // Microservicio de Editar
                    'http://127.0.0.1:5006/sync-delete'  // Microservicio de Leer
];
router.use(express.json()); // ✅ Middleware para JSON

// ✅ Verificar si `router` es válido antes de exportarlo
console.log("📌 Verificando `router` en userRoutes.js:", typeof router);



// ✅ Endpoint para sincronizar creación de usuarios desde otros microservicios
router.post('/sync-create', async (req, res) => {
    console.log('📌 Solicitud recibida en /sync-create:', req.body);
    const { id, first_name, last_name, identification_number, email, password_hash, phone_number } = req.body;

    try {
        const existingUser = await User.findByPk(id);
        if (!existingUser) {
            await User.create({ id, first_name, last_name, identification_number, email, password_hash, phone_number });
            console.log(`✅ Usuario con ID ${id} sincronizado en la base de Crear Usuario`);
        } else {
            console.log(`⚠️ Usuario con ID ${id} ya existe en la base de Crear Usuario`);
        }

        res.status(200).send({ message: `Usuario con ID ${id} sincronizado correctamente en Crear Usuario` });
    } catch (error) {
        console.error('❌ Error sincronizando usuario en Crear Usuario:', error);
        res.status(500).send({ error: 'Failed to sync user creation' });
    }
});


// ✅ Endpoint para sincronizar eliminación de usuarios desde otros microservicios
router.post('/sync-delete', async (req, res) => {
    console.log('📌 Solicitud recibida en /sync-delete:', req.body);
    const { id } = req.body;

    try {
        const user = await User.findByPk(id);
        if (user) {
            await user.destroy();
            console.log(`✅ User con ID ${id} eliminado en la base de Delete`);
        } else {
            console.log(`⚠️ User con ID ${id} no encontrado en Delete`);
        }

        res.status(200).send({ message: `User con ID ${id} eliminado correctamente en Delete` });
    } catch (error) {
        console.error('❌ Error sincronizando eliminación de user en Delete:', error);
        res.status(500).send({ error: 'Failed to sync user delete' });
    }
});

router.delete('/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        await user.destroy();
        console.log(`✅ Usuario con ID ${req.user.id} eliminado correctamente`);

        // 🔄 **Sincronizar con los demás microservicios**
        for (const instance of instances) {
            try {
                await axios.post(instance, { id: req.user.id });
                console.log(`✅ Usuario eliminado en ${instance}`);
            } catch (error) {
                console.error(`❌ Error eliminando en ${instance}:`, error.message);
            }
        }

        res.json({ message: 'Usuario eliminado correctamente' });

    } catch (error) {
        console.error('❌ Error eliminando usuario:', error.message);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

module.exports = router;
