// Muestra los usuarios guardados para comprobar que las contraseñas están cifradas.
require('dotenv').config({ quiet: true });
const db = require('../src/config/db');

console.table(db.prepare('SELECT id, usuario, password AS hash_password FROM usuarios').all());
