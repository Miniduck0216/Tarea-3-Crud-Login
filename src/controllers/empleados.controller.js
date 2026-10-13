// Controlador de empleados: las cuatro operaciones CRUD.
const Empleado = require('../models/empleado.model');

function renderForm(res, titulo, empleado, errores = [], estado = 200) {
  res.status(estado).render('empleados/form', {
    titulo,
    empleado,
    errores,
    departamentos: Empleado.DEPARTAMENTOS,
  });
}

// READ: lista (con búsqueda opcional)
function index(req, res) {
  const buscar = String(req.query.buscar || '').trim();
  res.render('empleados/index', {
    titulo: 'Empleados',
    empleados: Empleado.listar(buscar),
    resumen: Empleado.resumen(),
    buscar,
  });
}

// CREATE: formulario vacío
function nuevo(req, res) {
  renderForm(res, 'Nuevo empleado', {});
}

// CREATE: guardar
function crear(req, res) {
  const { datos, errores } = Empleado.validar(req.body);
  if (errores.length) return renderForm(res, 'Nuevo empleado', req.body, errores, 400);
  Empleado.crear(datos);
  req.session.mensaje = { tipo: 'exito', texto: `Empleado "${datos.nombre}" registrado.` };
  res.redirect('/empleados');
}

// UPDATE: formulario con los datos actuales
function editar(req, res, next) {
  const empleado = Empleado.obtener(req.params.id);
  if (!empleado) return next();
  renderForm(res, 'Editar empleado', empleado);
}

// UPDATE: guardar cambios
function actualizar(req, res, next) {
  const id = Number(req.params.id);
  if (!Empleado.obtener(id)) return next();
  const { datos, errores } = Empleado.validar(req.body, id);
  if (errores.length) return renderForm(res, 'Editar empleado', { ...req.body, id }, errores, 400);
  Empleado.actualizar(id, datos);
  req.session.mensaje = { tipo: 'exito', texto: `Empleado "${datos.nombre}" actualizado.` };
  res.redirect('/empleados');
}

// DELETE
function eliminar(req, res, next) {
  const empleado = Empleado.obtener(req.params.id);
  if (!empleado) return next();
  Empleado.eliminar(req.params.id);
  req.session.mensaje = { tipo: 'exito', texto: `Empleado "${empleado.nombre}" eliminado.` };
  res.redirect('/empleados');
}

module.exports = { index, nuevo, crear, editar, actualizar, eliminar };
