import { Cookies } from 'meteor/ostrio:cookies';
const cookies = new Cookies();
Template.stock.rendered=function(){
	 Meteor.subscribe('Productos');
	 Meteor.subscribe('Images');
	 Meteor.subscribe('Entidades');
	 Meteor.subscribe('Cuentas'); // se necesita para los precios
	 console.log(cookies.get("entidadPublica"))
	 Session.set("entidadPublica",cookies.get("entidadPublica"));
	 Session.set("productos",cookies.get("productos"));
	 // setTimeout(function(){cookies.set("productos",Session.get("productos")),3000})
}
function getDataProductos()
{
	var arr=Session.get("productos");
	var salida=[];
	for(var i=0;i<arr.length;i++){
		var prod=arr[i].producto;
		var object=arr[i];
		var porcentaje=(prod.porcentajeGanancia/100)+1;
		var precioVenta=Math.round(prod.precioCompra*porcentaje,2);
		     
		salida.push({idProducto:arr[i].producto._id,cantidad:arr[i].cantidad,importe:precioVenta})
	}
	return salida;
}
function finalizarPedido(){
	var entidad=Session.get("entidadPublica");
	if(!Session.get("entidadPublica")._id){
		var en=Entidades.findOne({telefono:Session.get("entidadPublica").telefono});
		if(en)entidad=en;
	}
	var aux={fecha:new Date(),idEntidad:entidad._id, estado:"PENDIENTE",productos:getDataProductos(),domicilioEntrega:$("#domicilio").val()};
	console.log(aux)
	if(Pedidos.insert(aux)){
		swal("Genial!","Se ha ingresado el pedido!, nos comunicaremos con ud a la brevedad!");
		Session.set("productos",[]);
		cookies.set("productos",[])
		Modal.hide();
	}else swal("Ops!","hay un error en el ingresos","error");
}
Template.finalizarPedido.events({
	"click #delete":function(){
	var data=this;
swal({   title: "Estas Seguro de quitarrrr?",   text: "Una vez que lo has quitado sera permanente!",   type: "warning",   showCancelButton: true,   confirmButtonColor: "#DD6B55",   confirmButtonText: "Si, borralo!",   closeOnConfirm: true },
    function(){
   
   var i=buscarProducto(data.producto);

   if(i>=0){
   
	   var arr=Session.get("productos");
	  arr.splice(i,1);
	   Session.set("productos",arr);
	   cookies.set("productos",arr)
   }
   
    
    })
	},
	 'mouseover tr': function(ev) {
    $("#tabla").find(".acciones").hide();
    $(ev.currentTarget).find(".acciones").show();
    
  },

	"click #btnFinalizar":function(){
		if($("#domicilio").val()=="")
			swal({   title: "Estas Seguro de finalizar sin domicilio de entrega?",   text: "Es importante para la entrega del pedido!",   type: "warning",   showCancelButton: true,   confirmButtonColor: "#a255dd",   confirmButtonText: "Si Ingresar!",   closeOnConfirm: true },
    function(){
	   	finalizarPedido()
    });
		else finalizarPedido()
	}
})
Template.finalizarPedido.helpers({
	"domicilioEntrega":function(){
		return Session.get("entidadPublica").domicilio
	},
	"razonSocial":function(){
		return Session.get("entidadPublica").razonSocial
	},
	"importeTotal":function(){
		var sum=0;
		var arr=Session.get("productos");
		for(var i=0;i<arr.length;i++){
			var prod=arr[i].producto;
			var object=arr[i];
			var porcentaje=(prod.porcentajeGanancia/100)+1;
		      var precioVenta=Math.round(prod.precioCompra*porcentaje,2);
		     
		      sum+=((Math.round(precioVenta/10)*10)*object.cantidad);
		}
		return sum.formatMoney(2); 
	},
	'settings': function(){
    
        return {
 collection: Session.get("productos"),
 rowsPerPage: 100,
showNavigationRowsPerPage:false,
showNavigation:false,
 class: "table table-condensed",
 showFilter: false,
 fields: [

    
   { 
        key: 'producto',
        label: 'Producto',
      fn: function (value, object, key) {
      	
        var prod=object.producto;
        if(prod)return prod.nombreProducto;
          return "s/n"; 
         }
      },
      { 
        key: 'cantidad',
        label: 'Cant.',
        headerClass: 'col-md-1',
      fn: function (value, object, key) {
          return value.toFixed(2);  
         }
      },
   { 
        key: 'importe',
        label: '$ Importe',
        headerClass: 'col-md-2',
      fn: function (value, object, key) {
      	
           var prod=object.producto; 
           if(prod){
           	var porcentaje=(prod.porcentajeGanancia/100)+1;
		      var precioVenta=Math.round(prod.precioCompra*porcentaje,2);
		     
		      return (Math.round(precioVenta/10)*10).formatMoney(2);
           }
           return 0;
         }
      },
       { 
        key: 'importe',
        label: '$ TOTAL',
        headerClass: 'col-md-1',
      fn: function (value, object, key) {
      	
           var prod=object.producto; 
           if(prod){
           	var porcentaje=(prod.porcentajeGanancia/100)+1;
		      var precioVenta=Math.round(prod.precioCompra*porcentaje,2);
		     
		      return ((Math.round(precioVenta/10)*10)*object.cantidad).formatMoney(2);
           }
           return 0;
         }
      },


   {
        label: '',
        headerClass: 'col-md-2',
        tmpl:Template.accionesPedidoPublico
      } 
 ]
 };
    }
})
Template.stock.helpers({
	"productos":function(){
		return Productos.find().fetch()
	},


})
Template.loginEntidadPublica.events({
	"click #btnAceptarNro":function(){
		if($("#tel").val()==""){
			swal("Ops...","Por favor ingresa un nro de telefono",'error');
			return;
		}
		var entidad=Entidades.findOne({telefono:$("#tel").val()});
		
		if(!entidad){
			$("#paso1").hide();
			$("#paso2").show();
		}else{
			Modal.hide();
			Session.set("entidadPublica",entidad);
			cookies.set("entidadPublica",entidad);
			setTimeout(function(){
			swal("Bien!","Hola "+entidad.razonSocial+" por favor completa el siguiente paso para finalizar el pedido","success");
			Modal.show("finalizarPedido");
			 }, 500);
			
		}
	}
})
AutoForm.hooks({
  'nuevaEntidadPublica_': {
    onSuccess: function (operation, result, template) {
    	Modal.hide();
    	 Session.set("entidadPublica",this.insertDoc);
		cookies.set("entidadPublica",this.insertDoc);
    	setTimeout(function(){Modal.show("finalizarPedido"); }, 500);
     
   },
    onError: function(operation, error, template) {
     swal("Ops!","ha ocurrido un erro al ingresar el registro:"+error,"error");
    }
  },
    
});
function buscarProducto(prod)
{
	var arr=Session.get("productos");
	if(!arr)return -1;
	for(var i=0;i<arr.length;i++){
		if(arr[i].producto._id==prod._id)return i;
	}
	return -1
}
function agregarProducto(prod)
{
	var arr=Session.get("productos");
	if(!arr)arr=[];
	var idx=buscarProducto(prod);
	console.log(idx)
	if(idx>=0) arr[idx].cantidad=arr[idx].cantidad+1;
		
	else arr.push({cantidad:1,producto:prod});
		
	cookies.set("productos",arr);
	Session.set("productos",arr);
	swal("Bien!","Producto agregado!","success")
}
Template.cadaProducto.events({
	"click #agregarProducto":function(){
		agregarProducto(this)
	}
})
Template.cadaProducto.helpers({
	"imagen":function(){
		var imagen=this.imagenes.length>0?this.imagenes[0]:null;
		var img=Images.findOne({_id:imagen._id});
		console.log(img)
		if(img)return img
	},
	"precio":function(){
		var pre= getPrecioVenta(this,0);
		if(pre) return new Spacebars.SafeString(pre)
	},
"disponible":function(){
	if(this.disponibilidad>0)return new Spacebars.SafeString("<span class='glyphicon glyphicon-shopping-cart'></span> En stock! entrega <b>inmediata</b>");
	return "En viaje, proximamente para entrega"
	
	},
	"precio2":function(){
		var pre= getPrecioVenta(this,1);
		if(pre) return new Spacebars.SafeString(pre)
	}
})