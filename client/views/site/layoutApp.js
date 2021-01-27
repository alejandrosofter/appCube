import { Cookies } from 'meteor/ostrio:cookies';
const cookies = new Cookies();

Template.layoutApp.helpers({
  "estaLogueado":function(){
    console.log(Meteor.user(),"logueado?");
    if(Meteor.user())return true
    return false
  },
     'esAdmin': function(){
     if(!Meteor.user())return false;
     if(Meteor.user().username==="admin")return true;
     if(Meteor.user().profile.rol==="administrador")return true;

       return false;
     },
  'nombreUsuario':function(){
    if(!Meteor.user())return "";
    return Meteor.user().username;
  }
});


Template.layoutApp.events({
   "click .salir":function(){
    
    swal({   title: "Estas Seguro de salir?",   text: "",   type: "warning",   showCancelButton: true,   confirmButtonColor: "#DD6B55",   confirmButtonText: "Si salir!",   closeOnConfirm: true },
    function(){
Meteor.logout()
    });

  },
"click .misDatos":function()
{
  var act=Meteor.user();
  Modal.show('modificarUsuario',function(){ return act; });
  $("#modalnuevoEquipo").on("hidden.bs.modal", function () {
    $('body').removeClass('modal-open');  
$('.modal-backdrop').remove();
});
},

"click .nuevoEquipo":function()
{
  var act=this;
  Modal.show('nuevoEquipo',function(){ return act; });
  $("#modalnuevoEquipo").on("hidden.bs.modal", function () {
    $('body').removeClass('modal-open');  
$('.modal-backdrop').remove();
});
},

})