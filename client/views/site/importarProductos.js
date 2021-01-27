Template.importarProductos.onCreated(function () {
  
});

Template.importarProductos.helpers({
 
});

Template.importarProductos.events({
 "change .file-upload-input": function(event, template){
   var func = this;
   var file = event.currentTarget.files[0];
   
   var reader = new FileReader();
   reader.onload = function(fileLoadEvent) {
     UIBlock.block('Subiendo Archivo, aguarde por favor...'); 
      Meteor.call('fileUpload', file, reader.result,function(err,res){
         UIBlock.unblock();
        if(!err){
          swal({   title: "Estas Seguro de proceder?",   text: "Una vez aceptado se borraran todos los productos y se cargaran los que estan en la planilla que subiste..",   type: "warning",   showCancelButton: true,   confirmButtonColor: "#4ba42e",   confirmButtonText: "Si, cargar!",   closeOnConfirm: true },
               function(){
             UIBlock.block('Ingresando productos, aguarde por favor...');
            Meteor.call('loadFile',$("#borrarDatosAnteriores:checked").val(),function(err,res){
            
		         UIBlock.unblock();
          });
          });
          
        }
      });
   };
   reader.readAsBinaryString(file);
}
});