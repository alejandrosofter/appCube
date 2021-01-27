Template.informeCuenta.events({

   'mouseover tr': function(ev) {
    $("#tableinforme").find(".acciones").hide();
    $(ev.currentTarget).find(".acciones").show();
    
  }

})
function buscar()
{
  SUIBlock.block('Cargando...');
  Meteor.call("buscarCuenta",$("#fechaDesde").val(),$("#fechaHasta").val(),$("#idCuenta").val(),function(err,res){
    Session.set("informeCuenta",res);
    console.log(res)
    SUIBlock.unblock();
  })
}
function getCuentas(){
  var ents=Cuentas.find().fetch();
  var data = $.map(ents, function (obj) {
  obj.id =  obj._id;
  obj.text=obj.nombreCuenta; // replace pk with your identifier

  return obj;
});
  return data;
}
Template.informeCuenta.rendered=function(){
  var d=new Date();
  var desde="01/"+(d.getMonth()+1)+"/"+d.getFullYear();
  var hasta="31/"+(d.getMonth()+1)+"/"+d.getFullYear();
  $("#fechaDesde").val(desde);
  $("#fechaHasta").val(hasta);
  $("#idCuenta").select2({data:getCuentas(),placeholder:"Seleccione Cuenta...",allowClear:true})
}
Template.informeCuenta.events({
"click #btnBuscar":function(){
  buscar()
}
})
Template.informeCuenta.helpers({
  "total":function(){
    return Session.get("informeCuenta").sumatoria(null,function(data){
      if(data.tipo=='Compras')return -data.importePago;
      return data.importePago;
      
    }).formatMoney(2)
  },
    'settings': function(){
    
        return {
 collection: Session.get("informeCuenta"),
 rowsPerPage: 100,

 class: "table table-condensed",
 showFilter: false,
 fields: [
   {
        key: 'fechaPago',
        label: 'Fecha',
        sortOrder: 0, sortDirection: 'descending',
     headerClass: 'col-md-1',
        fn: function (value, object, key) {
          var sortValue=moment(value).format("x");    
          return new Spacebars.SafeString("<span sort=" + sortValue + ">" + value.getFecha3() + "</span>");
 
         }
      },
      {
        key: 'idEntidad',
        label: 'Entidad',
     headerClass: 'col-md-1',
        fn: function (value, object, key) {
          var ent=Entidades.findOne({_id:value});
          if(ent)return ent.razonSocial;
            return "-"
         }
      },
 
 
    
   { 
        key: 'detalle',
        label: 'Detalle',
      fn: function (value, obj, key) {
       var tipo="<span class='label label-danger'>compra</span>";
    if(obj.tipo=="Ventas")tipo="<span class='label label-success'>venta</span>";
    if(obj.tipo=="OrdenesTrabajo")tipo="<span class='label label-info'>orden</span>";

        var detalle=obj.detalle;
    if(obj.tipo=="Ventas"){
      var sal="";
       for(var i=0;i<obj.detalle.length;i++)sal+=obj.detalle[i].nombreProducto+"("+obj.detalle[i].precioVenta+")"
       detalle= sal;
    }
    if(obj.tipo=="Compras"){

      var sal="";
      var arr=obj.detalle?obj.detalle:[];
      if(obj.detalle2)sal+=obj.detalle2;
       for(var i=0;i<arr.length;i++)sal+=arr[i].detalle+" | "
       detalle= sal;
      
    }
    return new Spacebars.SafeString(tipo+" "+detalle);
         }
      },
   { 
        key: 'importePago',
        label: '$ Importe',
        headerClass: 'col-md-2',
      fn: function (value, object, key) {
          return value.formatMoney(2)
         }
      },


 ]
 };
    }
});