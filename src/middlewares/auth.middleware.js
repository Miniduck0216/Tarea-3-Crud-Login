// Middlewares de autenticación.

// Protege una ruta: si no hay sesión, redirige al login recordando a dónde quería ir.
function requiereSesion(req, res, next) {
  if (req.session.usuario) {
    // Evita que el navegador muestre páginas protegidas desde la caché tras cerrar sesión.
    res.set('Cache-Control', 'no-store');
    return next();
  }
  req.session.mensaje = { tipo: 'error', texto: 'Debes iniciar sesión para ver esa página.' };
  res.redirect(`/login?volver=${encodeURIComponent(req.originalUrl)}`);
}

// Para /login y /registro: si ya hay sesión, no tiene sentido mostrarlos.
function soloInvitados(req, res, next) {
  if (req.session.usuario) return res.redirect('/empleados');
  next();
}

// Deja disponibles en todas las vistas el usuario y el mensaje flash (y lo borra).
function datosVista(req, res, next) {
  res.locals.usuario = req.session.usuario || null;
  res.locals.mensaje = req.session.mensaje || null;
  delete req.session.mensaje;
  next();
}

module.exports = { requiereSesion, soloInvitados, datosVista };
