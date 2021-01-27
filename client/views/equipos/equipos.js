
Template.equipos.onCreated(function () {

});

Template.equipos.helpers({

	'settings': function(){
        return {
 collection: Equipos.find(),
 rowsPerPage: 100,
 class: "table table-hover table-condensed",
 showFilter: false,
 fields: [

	   {
        key: 'nombreEquipo',
			 label:"Nombre Equipo",
      },
      {
        key: 'nroSerie',
        label: 'Serie Equipo',
      },
	 {
        key: 'versionSoftware',
        label: 'Version',
      },
      {
          label: '',
          //headerClass: 'col-md-1',
          tmpl: Template.accionesEquipos
        }
      
  
 ]
 };
    }

});

Template.equipos.events({
  "click #btnPrint":function(){
    window.print()
  },
  'mouseover tr': function(ev) {
    $("#tabla").find(".acciones").hide();
    $(ev.currentTarget).find(".acciones").show();

  },
  "click #btnAgregar":function(){
    Modal.show('nuevoEquipo',function(){ return null; });
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
   'click #modificar': function(ev) {
    var data=this;
    Modal.show("modificarEquipo",function(){
      return data
    })

  },
});
Template.modificarEquipo.helpers({
"data":function(){
  return this;
}
});
Template.nuevoEquipo.helpers({
"idUsuario":function(){
  return Meteor.user()._id;
}
});

Template.nuevoEquipo.events({
  
  "click #btnAgregarUsuario":function(){
    console.log("acet")
    var perfil=getPerfilUsuario();
  var usuario=$("#usuario").val();
    var clave=$("#password").val();
    UIBlock.block('Realizando consulta, aguarde por favor...');
    Meteor.call("users.add",usuario,clave,perfil,function(err,res){
      UIBlock.unblock();
      if(!err){
        consultarUsuarios();
        Modal.hide();

      }
      else swal("Ops..","hay un problema con la carga del nuevo usuario: "+err.message,"error")
    });

  },
})