//Cargamos el fichero de configuracion global
require('./config/config');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

const bodyParser = require('body-parser')
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
 
// parse application/json
app.use(bodyParser.json());

// Habilitar la carpeta public
// app.use( express.static('public'))); // Tambien funciona pero Fernando lo hace de otra forma
app.use( express.static(path.resolve( __dirname,'../public')));


// Configuración Global de rutas
app.use( require('./routes/index'));


mongoose.connect( process.env.URLDB, { useCreateIndex: true,useNewUrlParser: true }, ( err, resp ) => {
    if(err) throw err;

    console.log('Base de datos ONLINE');
});


app.listen(process.env.PORT, () => {
    console.log('Escuchando el puerto', process.env.PORT);
});