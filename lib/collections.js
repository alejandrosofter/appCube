import { Random } from 'meteor/random'

Equipos = new Mongo.Collection('equipos');

Settings = new Mongo.Collection('settings');


// INSTALAR sudo apt-get install graphicsmagick importante! en linux
// var createThumb = function(fileObj, readStream, writeStream) {

//   gm(readStream, fileObj.name()).resize("300", "300").stream().pipe(writeStream);
// };
// Images = new FS.Collection("images", {
//   stores: [
// new FS.Store.FileSystem("thumbs", { transformWrite: createThumb }),
//     new FS.Store.FileSystem("images"),


//     ]
// });


var schemaSettings = new SimpleSchema({
  clave: {
    type: String,
    label: "Clave",
  },
  valor: {
    type: String,
    label: 'Valor',
  },
  muchaData: {
    type: Boolean,
    label: 'mucho?',
    optional: true,
  },
  fecha: {
    type: Date,
    autoform: {
        style: "width:200px",
        type: 'datetime-local',
        autocomplete:"off",
      },
     label: 'Fecha',
    optional: true,

  },
  created: {
    type: Date,
    optional: true,
    autoValue: function() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return {
          $setOnInsert: new Date()
        };
      } else {
        this.unset();
      }
    },
  },
  updated: {
    type: Date,
    optional: true,
    autoValue: function() {
      if (this.isUpdate) {
        return new Date();
      }
    },
  },
 
});
var schemaEquipos = new SimpleSchema({
  
  fecha: {
    type: Date,
    label:"Fecha de Compra",
     autoform: {
        style: "width:200px",
        autocomplete:"off",
      },
  },
  nroSerie:{
    type:String,
    label:"Nro Serie (ver en parte posterior del equipo)",
     autoform: {
        style: "width:150px",
        autocomplete:"off",
      },
  },
  nombreEquipo:{
    type:String,
    label:"Equipo",
     autoform: {
        style: "width:300px",
        autocomplete:"off",
      },
  },
  ipPrivada:{
    type:String,
    label:"IP Privada",
    optional: true
  },
  claveRed:{
    type:String,
    label:"Clave RED (de su casa)",
    optional: true
  },
  claveCube:{
    type:String,
    label:"Clave CUBE",
    optional: true
  },
  ssid:{
    type:String,
    label:"NOMBRE RED (de su casa)",
    optional: true
  },
  versionSoftware:{
    type:String,
    label:"Ver.",
    optional: true
  },
  idUsuario:{
    type:String,
    label:"ID USUARIO"
  },
  estado:{
    type:String,
    label:"Estado",
    optional: true
  },
 eventos: {
    type: Array,
    label: 'Eventos',
    optional: true
  },
  "eventos.$":{
    type:Object,
  },
   "eventos.$.fecha":{

    type: Date,
    label:"Fecha"
 
  },
  "eventos.$._id":{
    label:"id",
    type: String,
    optional:true,
    autoValue: function() {
      return Random.id();   
    },
    autoform: {type:"hidden" },
 
  },

   "eventos.$.tipoEvento":{

    type: String,
    label:"Tipo de Evento"
 
  },
  "eventos.$.valor":{

    type: String,
    label:"Valor"
 
  },
  tareas: {
    type: Array,
    label: 'Tareas',
    optional: true
  },
  "tareas.$":{
    type:Object,
  },
   "tareas.$._id":{
    label:"id",
    type: String,
    optional:true,
    autoValue: function() {
      return Random.id();   
    },
    autoform: {type:"hidden" },
 
  },
   "tareas.$.fecha":{

    type: Date,
    label:"Fecha"
 
  },
   "tareas.$.data":{

    type: String,
    label:"DATA"
 
  },
   "tareas.$.accion":{

    type: String,
    label:"Accion"
 
  },

   "tareas.$.detalle":{

    type: String,
    label:"Detalle"
 
  },
  "tareas.$.estado":{

    type: String,
    label:"Estado"
 
  },

})

Equipos.attachSchema(schemaEquipos);

Settings.attachSchema(schemaSettings);
