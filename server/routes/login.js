const express = require('express');

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client( process.env.CLIENT_ID );

const Usuario = require('../models/usuario');

const app = express();


// LOGIN NORMAL
app.post('/login', ( req, res ) => {

    let body = req.body;

    // Validamos que existan los campos requeridos desde el POST
    if (!body.password || !body.email) {
        return res.status(412).json({
            ok: false,
            err: {
                message: "Parametros incompletos."
            }
        });
    }

    Usuario.findOne( { email: body.email }, ( err, usuarioDB ) => {

        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if( !usuarioDB ){
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Usuario) o contraseña incorrectos'
                }
            });
        }

        if( !bcrypt.compareSync( body.password, usuarioDB.password) ){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o (contraseña) incorrectos'
                }
            });
        }

        let token = jwt.sign({
            usuario : usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN }); //Expira en 30 días

        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });

    });   

});

// LOGIN CON GOOGLE
// Configuraciones de Google
async function verify( token ) { // jshint ignore:line
    
    const ticket = await client.verifyIdToken({ // jshint ignore:line
        idToken: token,
        audience: process.env.CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
    
  }


app.post('/google', async (req, res) => { 

    let token = req.body.idtoken; // jshint ignore:line
    let googleUser = await verify( token ) // jshint ignore:line
            .catch( e => {
                return res.status(403).json({
                    ok: false,
                    err: e
                });
            });
    
    Usuario.findOne({email: googleUser.email}, ( err, usuarioDB) => {

        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(usuarioDB) {

            if(usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe usar su autenticación normal'
                    }
                });
            } else {
                let token = jwt.sign({
                    usuario : usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN }); //Expira en 30 días
        
                 return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            }

        } else {
            // El usuario no existe en nuestra BBDD
            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            // usuario.password = ':)'; Para Google no es necesario

            usuario.save( (err, usuarioDB ) => {
                if(err){
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                let token = jwt.sign({
                    usuario : usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN }); //Expira en 30 días
        
                 return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            });
        }


    });
    

});




module.exports = app;