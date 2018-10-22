
const express = require('express');

const { verificaToken, verificaAdmin_Role } = require('../middelwares/autenticacion');

const Categoria = require('../models/categoria');

const app = express();

//==============================
// Mostrar todas las categorias
//==============================
app.get('/categoria', verificaToken , ( req, res ) => {

    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec( (err, categorias ) => {
            if(err){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                categorias                    
            });
        });

    /* Categoria.find({}, ( err, categorias ) => {

        if(err){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        Categoria.countDocuments( {}, ( err, total) => {
            
            if(err){
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                total,
                categorias                    
            });
        });

    }); */


});

//==============================
// Mostrar una categoria
//==============================
app.get('/categoria/:id', verificaToken , ( req, res ) => {

    let id = req.params.id;

    Categoria.findById( id, ( err, categoriaBD) => {

        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if(!categoriaBD){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoria no encontrada'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaBD
        });

    });

});

//==============================
// Crear una categoria
//==============================
app.post('/categoria',  verificaToken ,(req, res) => {
  
    let body = req.body;
    //let usuario = req.usuario;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });
    
    categoria.save( (err, categoriaDB) => {

      if(err){
          return res.status(500).json({
              ok: false,
              err
          });
      }
      if(!categoriaDB){
        return res.status(400).json({
            ok: false,
            err
        });
      }       
      res.json({
          ok: true,
          categoria: categoriaDB
      });

    });

});

//==============================
// Actualizar una categoria
//==============================
app.put('/categoria/:id', verificaToken , ( req, res ) => {

    let id = req.params.id;    
    let body = req.body;
    let descCategoria = {
        descripcion: body.descripcion
    };
    

    Categoria.findByIdAndUpdate( id, descCategoria, { new: true, runValidators: true, context: 'query' },( err, categoriaDB) => {

        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if(!categoriaDB){
          return res.status(400).json({
              ok: false,
              err
          });
        } 
        
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });

});

//==============================
// Borrar una categoria
//==============================
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => { //Borrado Físico

    let id = req.params.id;

    Categoria.findByIdAndRemove( id, ( err, categoriaDB) => {   

   

        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!categoriaDB){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'La Categoría no existe'
                }
            });
        }

        res.json({
            ok: true,
            message: 'Categoría borrada',
            categoria: categoriaDB
        });

    });
      
  });

module.exports = app;