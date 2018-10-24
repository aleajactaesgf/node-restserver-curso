
const express = require('express');
const fs = require('fs'); // Utilidad de manejo del filesystem
const path = require('path'); // Para contruir la ruta para acceder a las imagenes

const { verificaToken } = require('../middelwares/autenticacion');

const app = express();


app.get('/imagen/:tipo/:img', verificaToken, function( req, res ) {

    let tipo = req.params.tipo;
    let img = req.params.img;


    let pathImagen = path.resolve(__dirname, `../../uploads/${ tipo }/${ img }`);

    if( fs.existsSync(pathImagen)){
        res.sendFile(pathImagen);
    }else{
        let noImagePath = path.resolve(__dirname,'../assets/no-image.jpg');
        res.sendFile(noImagePath);
    }



});


module.exports = app;