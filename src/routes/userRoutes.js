const express = require('express');
const User = require('../models/user');

const router = express.Router();
router.use(express.json()); // ✅ Middleware para JSON

// ✅ Verificar si `router` es válido antes de exportarlo
console.log("📌 Verificando `router` en userRoutes.js:", typeof router);

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

module.exports = router;
