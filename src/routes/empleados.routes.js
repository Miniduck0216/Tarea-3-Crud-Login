const express = require('express');
const empleados = require('../controllers/empleados.controller');
const { requiereSesion } = require('../middlewares/auth.middleware');

const router = express.Router();

// Todas las rutas de este archivo están protegidas.
router.use(requiereSesion);

router.get('/', empleados.index);              // Leer (lista)
router.get('/nuevo', empleados.nuevo);         // Formulario de creación
router.post('/', empleados.crear);             // Crear
router.get('/:id/editar', empleados.editar);   // Formulario de edición
router.put('/:id', empleados.actualizar);      // Actualizar
router.delete('/:id', empleados.eliminar);     // Eliminar

module.exports = router;
