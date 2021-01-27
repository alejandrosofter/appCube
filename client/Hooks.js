var addHooks = {

  onSuccess: function(formType, result) {
    swal("Bien!","Se ha agregado el registro!","success");
    Modal.hide()
  },
  onError: function(formType, error) {
    console.log(error)
    swal("Ops!","Hay errores en el formulario, por favor verifique y vuelva a intentar","error");
  },

};

var agrego=false;
var addHooksLiquidacion = {

  onSuccess: function(formType, result) {
    swal("Bien!","Se ha agregado el registro de liquidacion!","success");
    if(!agrego){ Meteor.call("settings.autoincrementaNroLiquidacion"); agrego=true;buscarLiquidaciones()}
    setTimeout(function(){ agrego=false  }, 1000);
    Modal.hide()
  },
  onError: function(formType, error) {
    console.log(error)
    swal("Ops!","Hay errores en el formulario, por favor verifique y vuelva a intentar","error");
  },

};
var updateHooks = {
  onSuccess: function(formType, result) {
    swal("Bien!","Se ha modificado el registro!","success");
    var data=this.currentDoc;
   Modal.hide()
    // Meteor.call("agregarTarea",data,function(res){
    //   Modal.hide()
    // })
    
  },
  onError: function(formType, error) {
    console.log(error)
    swal("Ops!","Hay errores en el formulario, por favor verifique y vuelva a intentar","error");
  },
 
};
var updateHooksLiquidacion = {
  onSuccess: function(formType, result) {
    swal("Bien!","Se ha modificado el registro!","success");
    setTimeout(function(){ buscarLiquidaciones(); }, 300);
    Modal.hide();

  },
  onError: function(formType, error) {
    console.log(error)
    swal("Ops!","Hay errores en el formulario, por favor verifique y vuelva a intentar","error");
  },
 
};
var addHooksNueva = {

  onSuccess: function(formType, result) {
    Session.set("dataUltimaCarga",this.insertDoc);
    setLiquidacion();
    Modal.hide()
    setTimeout(function(){ 
      
    Modal.show("nuevaLiquidacion_factura",function(){
      return Session.get("liquidacion");
    });
     }, 1000);
    
    //swal("Bien!","Se ha agregado el registro!","success");
    
  },
  onError: function(formType, error) {
    console.log(error)
    swal("Ops!","Hay errores en el formulario, por favor verifique y vuelva a intentar","error");
  },

};


AutoForm.addHooks(['nuevoEquipo_',"nuevoEquipo_"], addHooks);
AutoForm.addHooks(['modificarEquipo_',"modificarEquipo_"], updateHooks);
Equipos.after.update(function (userId, doc, fieldNames, modifier, options) {
  // console.log( doc, fieldNames, modifier, options);
  Meteor.call("agregarTarea",doc,function(res){ })
});