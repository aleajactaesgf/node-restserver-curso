
//==========================
// PUERTO
//==========================
process.env.PORT = process.env.PORT || 3000;


//==========================
// ENTORNO
//==========================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';


//==========================
// VENCIMIENTO TOKEN
//==========================
// 60 segundos
// 60 minutos
// 24 horas
// 30 días
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

//==========================
// SEED
//==========================
process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';


//==========================
// BASE DE DATOS
//==========================
let urlDB;

if( process.env.NODE_ENV === 'dev' ){
    urlDB = 'mongodb://localhost:27017/cafe';
}else{
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;

//==========================
// Google Client ID
//==========================
process.env.CLIENT_ID = process.env.CLIENT_ID || '480903095829-f8tmuj0kidbq2pfb4ceu7gvdhc0i8805.apps.googleusercontent.com';



