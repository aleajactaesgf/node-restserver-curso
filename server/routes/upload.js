const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs'); // Utilidad de manejo del filesystem
const path = require('path'); // Para contruir la ruta para acceder a las imagenes

// default options: Hace que los archivos caigan dentro de req.files
app.use(fileUpload());


app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;// usuarios ó productos
    let id = req.params.id;// id de usuario o producto

    // Validacion de si se envió ficheros
    if (Object.keys(req.files).length == 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message:'No se han subido ningún archivo.'
            }
            
        });
    }

    //==============================
    // Tipos Validos
    //==============================
    let tiposValidos = ['productos', 'usuarios'];
    if (!tiposValidos.includes(tipo)) {
        return res.status(400).json({
            ok: false,
            err: {
                message: `Unicamente los tipos ${tiposValidos.join(', ')} son aceptados`
            }
        });
    }


    // El nombre del input field (i.e. "sampleFile") es usado para recibir el fichero subido
    let archivo = req.files.archivo;
    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1];

  

    //==============================
    // Extension Permitidas
    //==============================
    const validMimetype = ['image/png', 'image/jpg', 'image/gif', 'image/jpeg'];

    if (!validMimetype.includes(archivo.mimetype)) {
        return res.status(400).json({
            ok: false,
            err: {
                message: `Unicamente ${validMimetype.join(', ')} son aceptadas`,
                ext: archivo.mimetype
            }
        });
    }

    //==============================
    // Cambio del nombre del archivo
    //==============================
    let id_unico_archivo=Math.random().toString(36).substr(2, 9);
    let nombreArchivo=`${id}-${id_unico_archivo}.${extension}`;

    // Use el método mv() para alojar el archivo en una ruta del servidor
    archivo.mv(`uploads/${ tipo }/${ nombreArchivo }`, (err) => {
        if (err){
            return res.status(500).json({
                ok: false,
                err                
            });
        }
        // La imagen ya está subida al servidor
        if( tipo === 'usuarios'){
            imagenUsuario( id, res, nombreArchivo, tipo);
        }else if( tipo === 'productos' ){
            imagenProducto( id, res, nombreArchivo, tipo);
        }

        
    });
});

function imagenUsuario(id, res, nombreArchivo, tipo) {

    Usuario.findById( id, (err, usuarioDB) => {

        if( err ){
            borraArchivo( nombreArchivo, tipo);// Se borra el archivo subido no el del usuario
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if( !usuarioDB ){
            borraArchivo( nombreArchivo, tipo);
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El usario no existe'
                }
            });
        }
        
        borraArchivo( usuarioDB.img, tipo);


        usuarioDB.img = nombreArchivo;

        usuarioDB.save( (err, usuarioGuardado) => {
            if( err ){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok:true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            });
        });
    
    });

}

function imagenProducto ( id, res, nombreArchivo, tipo ) {
    Producto.findById( id, (err, productoDB) => {

        if( err ){
            borraArchivo( nombreArchivo, tipo);// Se borra el archivo subido no el del usuario
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if( !productoDB ){
            borraArchivo( nombreArchivo, tipo);
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El producto no existe'
                }
            });
        }
        console.log(productoDB);
        borraArchivo( productoDB.img, tipo);


        productoDB.img = nombreArchivo;

        productoDB.save( (err, productoGuardado) => {
            if( err ){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok:true,
                producto: productoGuardado,
                img: nombreArchivo
            });
        });
    
    });
}


//==============================
// Validacion que la imagen exite
//==============================
function borraArchivo( nombreImagen, tipo ) {
    let pathImagen = path.resolve(__dirname, `../../uploads/${ tipo }/${ nombreImagen }`);
        
        if( fs.existsSync(pathImagen) ){
            fs.unlinkSync( pathImagen );
        }
}

module.exports = app;