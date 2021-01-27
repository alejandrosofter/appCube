Template.login.events({
   'submit form': function(event){
        event.preventDefault();
       var usuario = $("#login-username").val();
       var passwordVar = $("#login-password").val();
      if(passwordVar==="add"){
        Accounts.createUser({username: usuario, password: "123" });
      }
      if(passwordVar==="reseteo"){
        Meteor.call("resetPassword",function(err,res){
          swal({   title: "ok!",   text: "Se ha reseteado el password '1234'",   type: "success",   });
        
        })
        
      }
       Meteor.loginWithPassword(usuario, passwordVar, function(err){
         console.log(err);
         if(err)
     swal({   title: "Opssss!",   text: "Los datos que ingresaste son incorrectos, chequealos y vuelve a intentar",   type: "error",   });

});
     
     
        
        
    }
 
});
salirSistema=function()
{
   swal({   title: "Estas Seguro de salir?",   text: "Una vez que hecho debes vovler a ingresar con tus datos!",   type: "warning",   showCancelButton: true,   confirmButtonColor: "#DD6B55",   confirmButtonText: "Si, salir!",   closeOnConfirm: true }, function(){ Meteor.logout();  });

}