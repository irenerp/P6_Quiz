
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');//importa MWs utilizados 
var bodyParser = require('body-parser');
var session = require('express-session');
var SequelizeStore = require('connect-session-sequelize')(session.Store);
var partials = require('express-partials');
var flash = require('express-flash');
var methodOverride = require('method-override'); //instalar metodo de navegar que permite solicitudes GET,POST, PUT, DELETE

var index = require('./routes/index'); //importa routers del directorio

var app = express(); //Crea la aplicación

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); //instalar renderizacion de vistas

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico'))); //Mostrar icono en la pestaña de internet
app.use(logger('dev'));
app.use(bodyParser.json()); //Instalar MWs que procesan partes de req o res
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Configuracion de la session para almacenarla en BBDD usando Sequelize.
var sequelize = require("./models");
var sessionStore = new SequelizeStore({
    db: sequelize,
    table: "session",
    checkExpirationInterval: 15 * 60 * 1000, // The interval at which to cleanup expired sessions in milliseconds. (15 minutes)
    expiration: 4 * 60 * 60 * 1000  // The maximum age (in milliseconds) of a valid session. (4 hours)
});
app.use(session({
    secret: "Quiz 2018",
    store: sessionStore,
    resave: false,
    saveUninitialized: true
}));

app.use(methodOverride('_method', {methods: ["POST", "GET"]})); //imoirtar metodo
app.use(express.static(path.join(__dirname, 'public')));
app.use(partials());
app.use(flash());

// Dynamic Helper:
app.use(function(req, res, next) {

    // To use req.session in the views
    res.locals.session = req.session;

    next();
});

app.use('/', index);

// catch 404 and forward to error handler
//Ningun MW anterior ha estendido la ruta. Actuan como controladores de respuestas de error
app.use(function(req, res, next) {
  var err = new Error('Not Found'); 
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500); //500 si no se ha definido el codigo de respuesta 
  res.render('error'); //renderiza la vista de respuesta de errores
});

module.exports = app;
