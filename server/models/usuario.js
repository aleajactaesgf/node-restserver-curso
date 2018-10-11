
const mongoose = require('mongoose');

const uniqueValidator = require('mongoose-unique-validator');

const rolesValidos = {
    values: ['ADMIN_ROLE','USER_ROLE'],
    message: '{VALUE} no es un rol válido'
};

const Schema = mongoose.Schema;

let usuarioSchema = new Schema({
    nombre:{
        type: String,
        required: [true, 'En nombre es necesario']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'En correo es necesario']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es necesaria']
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
});

// Para evitar enviar un paramatro, en este caso la password(NO USAR FUNCTION DE FLECHA)
usuarioSchema.methods.toJSON = function() {

    let user = this;
    let userObject = user.toObject();
    delete userObject.password;

    return userObject;

}


usuarioSchema.plugin( uniqueValidator, { message: '{PATH} debe ser único'});

module.exports = mongoose.model('Usuario', usuarioSchema);