// Punto de entrada: configura Express y conecta las rutas.
require('dotenv').config({ quiet: true });

const path = require('path');
const express = require('express');
const session = require('express-session');
const methodOverride = require('method-override');

const { datosVista } = require('./middlewares/auth.middleware');
const authRoutes = require('./routes/auth.routes');
const empleadosRoutes = require('./routes/empleados.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method')); // permite PUT y DELETE desde formularios HTML

app.use(
  session({
    name: 'sid',
    secret: process.env.SESSION_SECRET || 'secreto-de-desarrollo',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 }, // 1 hora
  })
);
app.use(datosVista);

app.get('/', (req, res) => res.redirect(req.session.usuario ? '/empleados' : '/login'));
app.use('/', authRoutes);
app.use('/empleados', empleadosRoutes);

// 404
app.use((req, res) => res.status(404).render('404', { titulo: 'No encontrado' }));

// Errores inesperados
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).render('404', { titulo: 'Error', error: 'Ocurrió un error inesperado.' });
});

app.listen(PORT, () => console.log(`Servidor listo en http://localhost:${PORT}`));
