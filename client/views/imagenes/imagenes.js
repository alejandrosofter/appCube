Template.nuevoArchivo.rendered=function()
{
	 
}
Template.nuevoArchivo.events({
  'change #archivos': function(event, template) {

  	var data=this;
    var files = event.target.files;
     FS.Utility.eachFile(event, function(file) {
 	Images.insert(file, function (err, fileObj) {
 		Meteor.call("productos.ingresarImagen",fileObj._id,data._id,function(err,res){

 		})
       
      });
     })
    
  }
});
Template.archivos.rendered=function()
{
	 Meteor.subscribe('Images');
   Session.set("idSeleccion",this.data._id);
	
}
Template.archivos.events({
   'mouseover tr': function(ev) {
    $("#tabla").find(".acciones").hide();
    $(ev.currentTarget).find(".acciones").show();
    
  },
  'click .delete': function() {
  	var ob=this;
    swal({   title: "Estas Seguro de quitar?",   text: "Una vez que lo has quitado sera permanente!",   type: "warning",   showCancelButton: true,   confirmButtonColor: "#DD6B55",   confirmButtonText: "Si, borralo!",   closeOnConfirm: false },
    function(){
    Meteor.call("productos.quitarImagen",Session.get("idSeleccion"),ob._id,function(err,res){
      swal("Quitado!", "El registro ha sido borrado", "success"); 
      Session.set("productosOrden",res);
    })
    
    
    
    });
  }
});
Template.accionesArchivos.events({

   'mouseover tr': function(ev) {
    $("#tabla").find(".acciones").hide();
    $(ev.currentTarget).find(".acciones").show();
    
  }
})
Template.archivos.helpers({
  "images":function()
  {
return Images.find().fetch()
  },
    'settings': function(){
    
        return {
 collection: this.imagenes,
 rowsPerPage: 100,

 class: "table table-condensed",
 showFilter: false,
 fields: [
   {
        key: '_id',
        label: 'Fecha',
     headerClass: 'col-md-1',
        fn: function (value, object, key) {
        	var img=Images.findOne({_id:value});
          if(img) return img.original.updatedAt.getFecha();
          return "-"
         }
      },
      {
        key: '_id',
        label: 'Archivo',
     // headerClass: 'col-md-2',
        fn: function (value, object, key) {
        	var img=Images.findOne({_id:value});
          if(img) return img.original.name;
          return "-"
         }
      },
      {
        key: '_id',
        label: 'Size',
     headerClass: 'col-md-1',
        fn: function (value, object, key) {
        	var img=Images.findOne({_id:value});
         if(img) return img.original.size;
         return "-"
         }
      },
 
    
   

   {
        label: '',
        headerClass: 'col-md-1',
        tmpl:Template.accionesArchivos
      } 
 ]
 };
    }
});