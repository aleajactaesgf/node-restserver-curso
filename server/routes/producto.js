
const express = require('express');

const { verificaToken } = require('../middelwares/autenticacion');

const Producto = require('../models/producto');

const app = express();


//==============================
// Obtener Productos
//==============================
app.get('/productos', verificaToken , ( req, res ) => {
    
    //Parametros paginación
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 0;
    limite = Number(limite);

    //Condiciones de la query
    let productosDisponibles = {
        disponible: true
    };
    //Condiciones de la query

    Producto.find( productosDisponibles)
        .skip(desde)
        .limit(limite)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec( ( err , productos ) => {
            if(err){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            Producto.countDocuments( productosDisponibles, ( err, total) => {
                if(err){
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
                res.json({
                    ok: true,
                    total,
                    productos                    
                });
            });

            
        });

    
});

//==============================
// Obtener un Producto por ID
//==============================
app.get('/productos/:id', verificaToken , ( req, res ) => {
    
    let id = req.params.id;
    Producto.findById( id )
    .populate('usuario', 'nombre email')
    .populate('categoria', 'descripcion')    
    .exec( ( err, productoDB) => {
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if(!productoDB){
            return res.status(400).json({
                ok: false,
                err:{
                    message: 'El ID no existe'
                }
            });
        }
        res.json({
            ok: true,
            producto: productoDB
        });
    });

    
});

//==============================
// Buscar Productos
//==============================
app.get('/productos/buscar/:termino', verificaToken , ( req, res ) => {

    let termino = req.params.termino;
    let regex = new RegExp(termino,'i');

    Producto.find({nombre: regex, disponible: true})
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion') 
        .exec( (err, productos) => {
            if(err){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                productos
            });
        });

});

//==============================
// Crear un Producto
//==============================
app.post('/productos', verificaToken , ( req, res ) => {
    
    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id

    });

    producto.save( (err, productoDB) => {

        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if(!productoDB){
          return res.status(400).json({
              ok: false,
              err
          });
        }       
        res.status(201).json({ // La petición ha sido completada y ha resultado en la creación de un nuevo recurso.
            ok: true,
            producto: productoDB
        });
  
      });

    
});

//==============================
// Actualizar un Producto
//==============================
app.put('/productos/:id', verificaToken , ( req, res ) => {
    
    let id = req.params.id;
    let body= req.body;

    //Verificamos que existe el producto
    Producto.findById( id, (err, productoDB) => {
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if(!productoDB){
            return res.status(400).json({
                ok: false,
                err:{
                    message: 'El ID no existe'
                }
            });
        }

        productoDB.nombre = body.nombre? body.nombre : productoDB.nombre;
        productoDB.precioUni = body.precioUni? body.precioUni : productoDB.precioUni;
        productoDB.descripcion = body.descripcion? body.descripcion : productoDB.descripcion;
        productoDB.disponible =body.disponible? body.disponible : productoDB.disponible;
        productoDB.categoria = body.categoria? body.categoria : productoDB.categoria;

        productoDB.save( (err, productoGuardado) => {
            if(err){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({ 
                ok: true,
                producto: productoGuardado
            });
        });
    });

    
});

//==============================
// Borrar un Producto
//==============================
app.delete('/productos/:id', verificaToken , ( req, res ) => {
    //Borrado Lógico cambiando el disponible a false
    let id = req.params.id;    

   
    //Verificamos que existe el producto
    Producto.findById( id, (err, productoDB) => {
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if(!productoDB){
            return res.status(400).json({
                ok: false,
                err:{
                    message: 'El ID no existe'
                }
            });
        }

        
        productoDB.disponible = false;
        

        productoDB.save( (err, productoBorrado) => {
            if(err){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({ 
                ok: true,
                producto: productoBorrado,
                mensaje: 'Producto borrado'
            });
        });
    });
    
});




module.exports = app;