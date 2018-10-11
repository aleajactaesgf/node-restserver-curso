const express = require('express');

const bcrypt = require('bcryptjs');
const _ = require('underscore');

const Usuario = require('../models/usuario');

const app = express();


app.get('/usuario', function (req, res) {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 0;
    limite = Number(limite);
    
    //Condiciones de la query
    let usuariosActivos = {
        estado: true
    };
    //Condiciones de la query

    Usuario.find( usuariosActivos, 'nombre email role estado google img')
        .skip(desde)
        .limit(limite)
        .exec( (err ,usuarios) => {
            if(err){
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Usuario.countDocuments( usuariosActivos, ( err, total) => {
                res.json({
                    ok: true,
                    total,
                    usuarios                    
                });
            });

            
        });
    
});
  
app.post('/usuario', function (req, res) {
  
      let body = req.body;
      
      let usuario = new Usuario({
          nombre: body.nombre,
          email: body.email,
          password: bcrypt.hashSync(body.password, 10),
          role: body.role
      });

      usuario.save( (err, usuarioDB) => {

        if(err){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        //Eliminamos la password en la respuesta. Comentado por hacerlo en el modelo.
        // usuarioDB.password = null;
        
        res.json({
            ok: true,
            usuario: usuarioDB
        });

      });
  
  });

// Actualizacion de Registro, en este caso usuario
app.put('/usuario/:id', function (req, res) {
  
      let id = req.params.id;
      //Con la libreria Underscore defino aquellos elementos a poder modificar
      let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

      Usuario.findByIdAndUpdate( id, body, { new: true, runValidators: true },( err, usuarioDB) => {

        if(err){
            return res.status(400).json({
                ok: false,
                err
            });
        }
        
        res.json({
            ok: true,
            usuario: usuarioDB
        });
      });
  
    
  });
  
app.delete('/usuario/:id', function (req, res) { //Borrado Físico

    let id = req.params.id;

    //Usuario.findByIdAndRemove( id, ( err, usuarioBorrado) => {

    let cambiaEstado = {
        estado: false
    };

    Usuario.findByIdAndUpdate( id, cambiaEstado, { new: true },( err, usuarioBorrado) => {

        if(err){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if(!usuarioBorrado){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });

    });
      
  });

  module.exports = app;