// Controlador de autenticación: login, registro y cierre de sesión.
const Usuario = require('../models/usuario.model');

// Solo se permite volver a rutas internas (evita redirecciones a otros sitios).
function rutaSegura(volver) {
  return typeof volver === 'string' && /^\/(?![/\\])/.test(volver) ? volver : '/empleados';
}

function mostrarLogin(req, res) {
  res.render('auth/login', { titulo: 'Iniciar sesión', volver: req.query.volver || '', valores: {} });
}

function login(req, res, next) {
  const usuario = String(req.body.usuario || '').trim();
  const password = String(req.body.password || '');
  const volver = req.body.volver || '';

  const encontrado = Usuario.verificarCredenciales(usuario, password);
  if (!encontrado) {
    return res.status(401).render('auth/login', {
      titulo: 'Iniciar sesión',
      volver,
      valores: { usuario },
      error: 'Usuario o contraseña incorrectos.',
    });
  }

  // Nueva sesión al ingresar (previene la fijación de sesión).
  req.session.regenerate((err) => {
    if (err) return next(err);
    req.session.usuario = { id: encontrado.id, nombre: encontrado.nombre, usuario: encontrado.usuario };
    req.session.mensaje = { tipo: 'exito', texto: `Bienvenido, ${encontrado.nombre}.` };
    res.redirect(rutaSegura(volver));
  });
}

function mostrarRegistro(req, res) {
  res.render('auth/registro', { titulo: 'Crear cuenta', valores: {}, errores: [] });
}

function registro(req, res) {
  const valores = {
    nombre: String(req.body.nombre || '').trim(),
    usuario: String(req.body.usuario || '').trim(),
  };
  const password = String(req.body.password || '');
  const confirmar = String(req.body.confirmar || '');

  const errores = [];
  if (!valores.nombre) errores.push('El nombre es obligatorio.');
  if (!/^[a-zA-Z0-9_.]{3,30}$/.test(valores.usuario))
    errores.push('El usuario debe tener de 3 a 30 caracteres (letras, números, punto o guion bajo).');
  if (password.length < 6) errores.push('La contraseña debe tener al menos 6 caracteres.');
  if (password !== confirmar) errores.push('Las contraseñas no coinciden.');
  if (!errores.length && Usuario.buscarPorUsuario(valores.usuario))
    errores.push('Ese nombre de usuario ya está registrado.');

  if (errores.length) {
    return res.status(400).render('auth/registro', { titulo: 'Crear cuenta', valores, errores });
  }

  Usuario.crear({ ...valores, password });
  req.session.mensaje = { tipo: 'exito', texto: 'Cuenta creada. Ya puedes iniciar sesión.' };
  res.redirect('/login');
}

function logout(req, res, next) {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('sid');
    res.redirect('/login');
  });
}

module.exports = { mostrarLogin, login, mostrarRegistro, registro, logout };
