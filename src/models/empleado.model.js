// Modelo Empleado: operaciones CRUD sobre la tabla "empleados".
const db = require('../config/db');

const DEPARTAMENTOS = [
  'Administración',
  'Contabilidad',
  'Finanzas',
  'Recursos Humanos',
  'Ventas',
  'Tecnología',
];

function listar(buscar = '') {
  if (buscar) {
    const patron = `%${buscar}%`;
    return db
      .prepare(
        'SELECT * FROM empleados WHERE nombre LIKE ? OR cargo LIKE ? OR departamento LIKE ? ORDER BY nombre'
      )
      .all(patron, patron, patron);
  }
  return db.prepare('SELECT * FROM empleados ORDER BY nombre').all();
}

function obtener(id) {
  return db.prepare('SELECT * FROM empleados WHERE id = ?').get(id);
}

function correoEnUso(correo, exceptoId = 0) {
  return Boolean(db.prepare('SELECT 1 FROM empleados WHERE correo = ? AND id <> ?').get(correo, exceptoId));
}

function crear(e) {
  return db
    .prepare(
      'INSERT INTO empleados (nombre, correo, cargo, departamento, salario, fecha_ingreso) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .run(e.nombre, e.correo, e.cargo, e.departamento, e.salario, e.fecha_ingreso).lastInsertRowid;
}

function actualizar(id, e) {
  return db
    .prepare(
      'UPDATE empleados SET nombre = ?, correo = ?, cargo = ?, departamento = ?, salario = ?, fecha_ingreso = ? WHERE id = ?'
    )
    .run(e.nombre, e.correo, e.cargo, e.departamento, e.salario, e.fecha_ingreso, id).changes > 0;
}

function eliminar(id) {
  return db.prepare('DELETE FROM empleados WHERE id = ?').run(id).changes > 0;
}

// Total de la nómina mensual (para el resumen del listado).
function resumen() {
  return db.prepare('SELECT COUNT(*) AS total, COALESCE(SUM(salario), 0) AS nomina FROM empleados').get();
}

// Limpia y valida los datos que llegan del formulario.
function validar(cuerpo, exceptoId = 0) {
  const datos = {
    nombre: String(cuerpo.nombre || '').trim(),
    correo: String(cuerpo.correo || '').trim().toLowerCase(),
    cargo: String(cuerpo.cargo || '').trim(),
    departamento: String(cuerpo.departamento || '').trim(),
    salario: Number(cuerpo.salario),
    fecha_ingreso: String(cuerpo.fecha_ingreso || '').trim(),
  };
  const errores = [];
  if (!datos.nombre) errores.push('El nombre es obligatorio.');
  if (datos.nombre.length > 100) errores.push('El nombre no puede pasar de 100 caracteres.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)) errores.push('El correo no es válido.');
  else if (correoEnUso(datos.correo, exceptoId)) errores.push('Ya existe un empleado con ese correo.');
  if (!datos.cargo) errores.push('El cargo es obligatorio.');
  if (!DEPARTAMENTOS.includes(datos.departamento)) errores.push('Selecciona un departamento válido.');
  if (cuerpo.salario === '' || !Number.isFinite(datos.salario) || datos.salario < 0)
    errores.push('El salario debe ser un número mayor o igual a 0.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datos.fecha_ingreso) || Number.isNaN(Date.parse(datos.fecha_ingreso)))
    errores.push('La fecha de ingreso no es válida.');
  return { datos, errores };
}

module.exports = { DEPARTAMENTOS, listar, obtener, crear, actualizar, eliminar, resumen, validar };
