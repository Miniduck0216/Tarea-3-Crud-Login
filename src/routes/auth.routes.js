const express = require('express');
const auth = require('../controllers/auth.controller');
const { soloInvitados } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/login', soloInvitados, auth.mostrarLogin);
router.post('/login', soloInvitados, auth.login);
router.get('/registro', soloInvitados, auth.mostrarRegistro);
router.post('/registro', soloInvitados, auth.registro);
router.post('/logout', auth.logout);

module.exports = router;
