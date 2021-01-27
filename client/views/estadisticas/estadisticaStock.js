Template.estadisticaStock.helpers({
     'cantidadConStock': function(){
     return Productos.find({disponibilidad:{$gt: 0}}).fetch().length;
     },
  'nombreUsuario':function(){
    return Meteor.user().username;
  }
});