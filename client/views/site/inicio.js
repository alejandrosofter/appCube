//import '/imports/reconocedorVoz';
//6440328845  
Template.inicio.rendered=function(){
	
	
}
Template.ctaCte.rendered=function(){
	console.log(this)
}
Template.inicio.events({
  

})
Template.accionesEquipos2.events({
  
"click #ver":function(){
    Session.set("equipoSeleccion",this.eventos);
    Session.set("tareasEquipoSeleccion",this.tareas);
    console.log(this.tareas)
  },
"click .actualizarEquipo":function()
{
  Meteor.call("actualizarEquipo",this.nroSerie,function(res){
    swal("Bien!","Se envio la peticion de actualizacion")
  })
},
"click #editar":function(){
  var act=this;
   Modal.show('modificarEquipo',function(){ return act; });
  $("#modalmodEquipo").on("hidden.bs.modal", function () {
    $('body').removeClass('modal-open');  
$('.modal-backdrop').remove();
});
  },

})

Template.inicio.events({
  "click #btnPrint":function(){
    window.print()
  },
    "click #nuevoEquipo":function(){
  var act=this;
   Modal.show('nuevoEquipo',function(){ return act; });
  
  },
  'mouseover tr': function(ev) {
    $("#tabla").find(".acciones").hide();
    $(ev.currentTarget).find(".acciones").show();

  },
   'click #delete': function(ev) {
    var id = this._id;
    swal({
      title: "Estas Seguro de quitar?",
      text: "Una vez que lo has quitado sera permanente!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Si, borralo!",
      closeOnConfirm: true
    }, function() {
     Equipos.remove(id)
      
    });

  },


});
Template.inicio.helpers({
'settings': function(){
        return {
 collection: Equipos.find(),
 rowsPerPage: 100,
 showNavigationRowsPerPage:false,
 showNavigation:"never",
 class: "table table-hover table-condensed",
 showFilter: false,
 fields: [

     {
        key: 'nombreEquipo',
       label:"Nombre Equipo",
      },
      {
          label: '',
          headerClass: 'col-md-4',
          tmpl: Template.accionesEquipos2
        }
      
  
 ]
 };
    },
    'settingsEventos': function(){
        return {
 collection: Session.get("equipoSeleccion"),
 rowsPerPage: 100,
 class: "table table-hover table-condensed",
 showFilter: false,
 fields: [

      {
        key: 'fecha',
       label:"Fecha",
        fn: function (value, object, key) {
         if(value)  return moment(value).format("DD/MM/YYYY");
           return "-"
         },
      },
      {
        key: 'tipoEvento',
       label:"Tipo Evento",
      },
      {
        key: 'valor',
       label:"Valor",
      },

      
  
 ]
 };
    }
    ,
     'settingsTareas': function(){
        return {
 collection: Session.get("tareasEquipoSeleccion"),
 rowsPerPage: 100,
 class: "table table-hover table-condensed",
 showFilter: false,
 showNavigationRowsPerPage:false,
 showNavigation:"never",
 fields: [

      {
        key: 'fecha',
       label:"Fecha",
        fn: function (value, object, key) {
         if(value)  return moment(value).format("DD/MM/YYYY");
           return "-"
         },
      },
      {
        key: 'detalle',
       label:"Detalle",
      },
      {
        key: 'estado',
       label:"Estado",
      },

      
  
 ]
 };
    }
	
})
