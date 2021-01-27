Template.datosSistema.helpers({
  "certificado":function(){
    return Settings.findOne({clave:"certificado_fe"}).valor;
  },
  "privada":function(){
    return Settings.findOne({clave:"privada_fe"}).valor;
  },
  "pedido":function(){
    return Settings.findOne({clave:"pedido_fe"}).valor;
  },

    'settings': function(){
        return {
 collection: Settings.find(),
 rowsPerPage: 30,
 showFilter: false,
class: "table table-condensed",
 fields: [
      {
        key: 'clave',
        label: 'Clave',
        headerClass: 'col-md-2',
      },
   {
        key: 'valor',
        label: 'Valor',
        fn:function(valor,obj){
          if(obj.muchaData)return "**data**"; else return valor;
        }
      },
   
   {
        label: '',
        headerClass: 'col-md-2',
        tmpl:Template.accionesDatosSistema
      }
 ]
 };
    }
});

Template.datosSistema.events({
  "change .file-upload-input": function(event, template){
   var func = this;
   var file = event.currentTarget.files[0];
   
   var reader = new FileReader();
   reader.onload = function(fileLoadEvent) {
     UIBlock.block('Subiendo Archivo, aguarde por favor...'); 
      Meteor.call('certificadoUpload', file, reader.result,function(err,res){
         UIBlock.unblock();
        if(!err){
          
             UIBlock.block('Chequeando certificado...');
            Meteor.call('checkCertificadoElectronico',function(err,res){
            if(!err)swal("RES",res,"success");
              else swal("Ops..",err);
		         UIBlock.unblock();
          });
          
          
        }
      });
   };
   reader.readAsBinaryString(file);
},
 "click #escribir":function(){
  Meteor.call("escribeDatosFE",$("#certificado").val(),$("#privada").val(),function(){
    swal("bien!","Se han escrito los datos!","success");
  })
 },

	  "click #checkearCodighoVerificacion":function()
  {

     UIBlock.block('Chequeando codigo '+$("#codigoVerificacion").val());
            Meteor.call('checkearCodigoVerificacion',$("#codigoVerificacion").val(),function(err,res){
            if(!err)swal("RESULTADO:",res,"success");
              else swal("Ops..",err);
		         UIBlock.unblock();
          });
  },
		  "click #btnMensajePrueba":function()
  {

     UIBlock.block('Enviando Mensaje a'+$("#telefonoPrueba").val());
            Meteor.call('enviarMensajePruebaWhatsap',$("#telefonoPrueba").val(),function(err,res){
            if(!err)swal("RESULTADO:",res,"success");
              else swal("Ops..",err);
		         UIBlock.unblock();
          });
  },
	  "click #socitarCodigoWhatsap":function()
  {
		var nro=Settings.findOne({clave:"nroWhatsap"});
		var mcc=Settings.findOne({clave:"nroWhatsap_mcc"});
		var mnc=Settings.findOne({clave:"nroWhatsap_mnc"});
     UIBlock.block('Solicitando codigo a '+nro.valor+' mcc:'+mcc.valor+" mnc: "+mnc.valor+"");
            Meteor.call('solicitarCodigoWhatsap',function(err,res){
            if(!err)swal("RESULTADO:",res,"success");
              else swal("Ops..",err);
		         UIBlock.unblock();
          });
  },
  "click #checkCertificado":function()
  {
     UIBlock.block('Chequeando certificado...');
            Meteor.call('checkCertificadoElectronico',function(err,res){
            if(!err)swal("RES",res,"success");
              else swal("Ops..",err);
             UIBlock.unblock();
          });
  },
  "click #vaciarImagenes":function()
  {
     UIBlock.block('Quitando Imagenes...');
            Meteor.call('images.deleteAll',function(err,res){
            if(!err)swal("Ok!","SE han quitado las imagenes","success");
              else swal("Ops..",err);
             UIBlock.unblock();
          });
  },
  "click #generarPedido":function()
  {
     UIBlock.block('Generando pedido AFIP...');
            Meteor.call('generarPedidoAfip',function(err,res){
            if(!err){
						 console.log(res)
							//  var contentType = 'application/octet-stream';
							// var a = document.createElement('a');
							// var blob = new Blob([res], {'type':contentType});
							// a.href = window.URL.createObjectURL(blob);
							// a.download = "emrpesa.csr";
							// a.click();
              
              swal("bien!","se creo el pedido, ahora copia y pega en un archivo para ingresar en web AFIP!","success")
              UIBlock.unblock();
            }
              else swal("Ops..",err);
		         
          });
  },
  'mouseover tr': function(ev) {
    $("#tablaDatosSistema").find(".acciones").hide();
    $(ev.currentTarget).find(".acciones").show();
    
  },
  'click #traerDatosElectronica': function(ev) {
     Meteor.call("datosFacturaElectronica",function(err,res){   
 swal("GENIAL!","Se han actualizado los datos","success");
 });
  },
  'click #generarVariables': function(ev) {
     Meteor.call("generarVariables",function(err,res){   
 swal("GENIAL!","Se han actualizado los datos","success");
 });
  },
  'click .delete': function(ev) {
    var id=this._id;
    swal({   title: "Estas Seguro de quitar?",   text: "Una vez que lo has quitado sera permanente!",   type: "warning",   showCancelButton: true,   confirmButtonColor: "#DD6B55",   confirmButtonText: "Si, borralo!",   closeOnConfirm: true }, function(){ Settings.remove(id); swal("Quitado!", "El registro ha sido borrado", "success"); });

  },
  'click .update': function(ev) {
    Router.go('/modificarDatosSistema/'+this._id);
  },
  
});
AutoForm.hooks({
  'nuevoDatosSistema_': {
    onSuccess: function (operation, result, template) {
     swal("GENIAL!","Se ha ingresado!","success");
    },
    onError: function(operation, error, template) {
     swal("Ops!","ha ocurrido un erro al ingresar el registro:"+error,"error");
    }
  },
    'modificarDatosSistema_': {
    onSuccess: function (operation, result, template) {
     swal("GENIAL!","Se ha modificado !","success");
      Router.go('/datosSistema/');
    },
    onError: function(operation, error, template) {
     swal("Ops!","ha ocurrido un erro al ingresar el registro:"+error,"error");
    }
  }
});