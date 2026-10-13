// Conexión a SQLite y creación de las tablas.
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const archivo = path.join(__dirname, '..', '..', process.env.DB_FILE || 'adminpro.db');
const db = new Database(archivo);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre     TEXT    NOT NULL,
    usuario    TEXT    NOT NULL UNIQUE,
    password   TEXT    NOT NULL,          -- hash bcrypt, nunca la contraseña en texto plano
    creado_en  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS empleados (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre         TEXT    NOT NULL,
    correo         TEXT    NOT NULL UNIQUE,
    cargo          TEXT    NOT NULL,
    departamento   TEXT    NOT NULL,
    salario        REAL    NOT NULL CHECK (salario >= 0),
    fecha_ingreso  TEXT    NOT NULL,      -- formato AAAA-MM-DD
    creado_en      TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
`);

// Semilla: un administrador y algunos empleados para que la app no arranque vacía.
const hayUsuarios = db.prepare('SELECT COUNT(*) AS total FROM usuarios').get().total > 0;
if (!hayUsuarios) {
  const usuario = process.env.ADMIN_USUARIO || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'Admin123';
  db.prepare('INSERT INTO usuarios (nombre, usuario, password) VALUES (?, ?, ?)')
    .run('Administrador', usuario, bcrypt.hashSync(password, 10));
  console.log(`Usuario inicial creado: ${usuario}`);
}

const hayEmpleados = db.prepare('SELECT COUNT(*) AS total FROM empleados').get().total > 0;
if (!hayEmpleados) {
  const insertar = db.prepare(
    'INSERT INTO empleados (nombre, correo, cargo, departamento, salario, fecha_ingreso) VALUES (?, ?, ?, ?, ?, ?)'
  );
  insertar.run('María Torres', 'mtorres@adminpro.ec', 'Contadora general', 'Contabilidad', 1450, '2021-03-15');
  insertar.run('Carlos Vega', 'cvega@adminpro.ec', 'Analista de nómina', 'Recursos Humanos', 1100, '2022-08-01');
  insertar.run('Lucía Paredes', 'lparedes@adminpro.ec', 'Asistente administrativa', 'Administración', 850, '2024-01-10');
}

module.exports = db;
