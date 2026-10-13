// Modelo Usuario: acceso a la tabla "usuarios" y manejo de contraseñas.
const bcrypt = require('bcryptjs');
const db = require('../config/db');

const RONDAS_BCRYPT = 10;

function buscarPorUsuario(usuario) {
  return db.prepare('SELECT * FROM usuarios WHERE usuario = ?').get(usuario);
}

function crear({ nombre, usuario, password }) {
  const hash = bcrypt.hashSync(password, RONDAS_BCRYPT);
  const resultado = db
    .prepare('INSERT INTO usuarios (nombre, usuario, password) VALUES (?, ?, ?)')
    .run(nombre, usuario, hash);
  return resultado.lastInsertRowid;
}

// Devuelve el usuario (sin el hash) si las credenciales son correctas, o null.
function verificarCredenciales(usuario, password) {
  const encontrado = buscarPorUsuario(usuario);
  if (!encontrado || !bcrypt.compareSync(password, encontrado.password)) return null;
  const { password: _hash, ...datos } = encontrado;
  return datos;
}

module.exports = { buscarPorUsuario, crear, verificarCredenciales };
