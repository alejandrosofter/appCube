var recognition;
var recognizing = false;
var dataOrden;
var entidadSeleccion=null;
var textoSalida="";
var tipoComando="";
var contenedorSalida="textoReconoce";
var arrEntidades=[];
var datosEntidad;
var datosPagoOrden;
var meses=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];

var cuentas=[];
var textoHabla="";
var nroOrdenSeleccion=null;
var datosGasto={idEntidad:"",detalle:"",importe:"",fecha:""};
var idCompraSeleccion;
var comandos=["si","saldo","agregar gasto","finalizar","buscar","pagar orden","agregar entidad","agregar persona","agregar personas","salir","agregar orden"]

Template.reconocedorVoz.rendered=function()
{
	init();
}
Template.reconocedorVoz.helpers({
	"entidad_razonSocial":function(){
		return entidadSeleccion.razonSocial
	},
	"entidad_telefono":function(){
		return entidadSeleccion.telefono
	},
	"entidad_nroDocumento":function(){
		return entidadSeleccion.razonSocial
	},
	"cuenta_nombreCuenta":function()
	{

	},
	"nroOrdenSeleccion":function()
	{	
		return nroOrdenSeleccion
	},
	"comandos":function()
	{
		return comandos
	}

})
function init()
{
	consultarCuentas();
	resetOrden();
	resetPagoOrden();
	resetNuevaEntidad();
	iniciarDetector();
	setTimeout(function(){mostrarComandos()},4000);
	document.addEventListener("keydown", keyDownTextField, false);
	$( ".entidadVoz" ).on( "click", function() { console.log(ev,this) });
	

}
function mostrarComandos(){
	
	var sal="Los comandos disponibles son: <br>";
	for(var i=0;i<comandos.length;i++)
		sal+="<h5>"+comandos[i]+"</h5>"
	console.log(sal)
	$("#comandos").html(sal)
}
function resetPagoOrden()
{
	datosPagoOrden={nroOrden:"",fecha:new Date(), importe:"",formaPago:"",idCuenta:"",interes:0}
}
function pagoOrdenValida()
{
	if(nroOrden=="")return false;
	if(importe=="")return false;
	if(formaPago=="")return false;
	if(idCuenta=="")return false;
	return true
}
function consultarCuentas()
{
	Meteor.call("cuentas.find",function(err,res){
		cuentas=res;
	})
}


function getDataOrden(salida)
{
	var arr=salida.split(" ");
var entidad=arr[2];
var detalle=salida.substring(salida.indexOf(entidad)+entidad.length);
var salida= {entidad:entidad,detalle:detalle}
console.log(salida);
return salida;
}
function mostrarOrden(salida)
{
	var act=getDataOrden(salida);
		Modal.show('nuevaOrdenTrabajo',function(){ return act; });
  $("#modalnuevaOrdenTrabajo").on("hidden.bs.modal", function () {
    $('body').removeClass('modal-open');  
$('.modal-backdrop').remove();
});
}
function mostrarEntidades(entidades)
{
	var salida="Se encontro: ";
	for(var i=0;i<entidades.length;i++)salida+=entidades[i].razonSocial;
	mostrar(entidades,"entidades");
	salida.hablar();
}
function leerOrden(entidad,detalle)
{
	var salida="Orden para "+entidad.razonSocial+" detalle: "+detalle;
	salida.hablar();
}
function pedir(texto,comando)
{
	texto.hablar();
	var tiempo=texto.length*95;
	setTimeout(function(){iniciarReconocimientoVoz(comando)},tiempo);
	
}
function resetOrden(){
	Meteor.call("ordenDefault",function(err,res){
		console.log(res)
		dataOrden=res;
		console.log(dataOrden)
	})
	
}

function finalizarOrden()
{
	var esSi=textoSalida.indexOf("si")!=-1;
	var texto="Orden Cargada";
	console.log(dataOrden)
	mostrar(dataOrden,"nuevaOrden")
	if(esSi){
		Meteor.call("ordenesTrabajo.insert",dataOrden,function(err,res){
			if(!err){
				texto.hablar();
			resetOrden();
		}else ("no se pudo cargar: "+err.message).hablar()
			
		})
		// Entidades.insert(dataOrden)
		
	}
	else pedir("Que necesitas?",solicitarTarea)
}
function NuevaEntidad()
{
	var esSi=textoSalida.indexOf("si")!=-1;
	var texto="Entidad Cargada";
	console.log(datosEntidad)
	if(esSi){
		Meteor.call("entidades.insert",datosEntidad,function(err,res){
			if(!err){
				texto.hablar();
			resetNuevaEntidad();
		}else console.log(err)
			
		})
		// Entidades.insert(dataOrden)
		
	}
	else pedir("Que necesitas?",solicitarTarea)
}
function resetNuevaEntidad()
{
	datosEntidad={razonSocial:"",telefono:"",default:false}
}

function pideDatosEntidad()
{
	var nombre=textoSalida.substring(0,textoSalida.indexOf("telefono"));
	var telefono=textoSalida.substring(textoSalida.indexOf("telefono")+8);
	datosEntidad.razonSocial=nombre;
	datosEntidad.telefono=telefono;
	mostrar(datosEntidad,"nuevaEntidad")
	pedir("Bien lo cargamos?","finalizarNuevaEntidad");
}
function ordenValida()
{
	if(dataOrden.descripcionCliente=="")return false;
	return true;
}
function entidadValida()
{
	if(datosEntidad.razonSocial=="")return false;
	if(datosEntidad.telefono=="")return false;
	return true
}
function pideDatosOrden()
{

	dataOrden.descripcionCliente=textoSalida.substring(5);
	if(entidadSeleccion){
		 dataOrden.idEntidad=entidadSeleccion._id;
		 pedir("Listo la cargamos?","finalizarOrden")
	}
	else pedir("A quien busco?","solicitarTarea")
}

function cargarPagoCompra()
{
	var esSi=textoSalida.indexOf("si")!=-1;
	var texto="Gasto cargado, te parece que lo ";
	console.log(datosGasto)
	if(esSi){
		Meteor.call("compras.cargar",datosGasto,function(err,res){
			if(!err){
				pedir(texto,"cargarPagoCompra");
				idCompraSeleccion=res;
			resetPagoOrden();
		}else err.reason.hablar()
			
		})
		// Entidades.insert(dataOrden)
		
	}
	else pedir("Que necesitas?",solicitarTarea)
}
function finalizarGasto()
{
		var esSi=textoSalida.indexOf("si")!=-1;
	var texto="Gasto cargado!";
	console.log(datosGasto)
	if(esSi){
		Meteor.call("compras.cargar",datosGasto,function(err,res){
			if(!err){
				texto.hablar();
				idCompraSeleccion=res;
			resetPagoOrden();
		}else err.reason.hablar()
			
		})
		// Entidades.insert(dataOrden)
		
	}
	else pedir("Que necesitas?",solicitarTarea)
}
function pideDatosGasto()
{
	datosGasto.importe=textoSalida.substring(0,textoSalida.indexOf("en")).trim();
	datosGasto.formaPago=textoSalida.substring(textoSalida.indexOf("en")+2,textoSalida.indexOf("por")).trim();
	datosGasto.detalle=textoSalida.substring(textoSalida.indexOf("por")+3).trim();
	datosGasto.idFormaPago=getIdFormaPago(datosGasto.formaPago);
	if(!datosGasto.idFormaPago){
		 pedir("No econtre la forma de pago. Decime de nuevo","pideDatosGasto");
		 return;
	}
	var textoFecha=textoSalida.indexOf("fecha")==-1?"":textoSalida.substring(textoSalida.indexOf("fecha")+5);
	datosGasto.fecha=getFecha(textoFecha);
	if(entidadSeleccion){
		 datosGasto.idEntidad=entidadSeleccion._id;
		 pedir("Listo la cargamos?","finalizarGasto")
	}
	else pedir("A quien busco?","solicitarTarea")
}
function getIdFormaPago(strCuenta)
{
	console.log(strCuenta)
	strCuenta=strCuenta.replaceAll(" ","").trim().toLowerCase();
	for(var i=0;i<cuentas.length;i++){
		var nombreCuenta=cuentas[i].nombreCuenta.replaceAll(" ","").trim().toLowerCase();
		
		console.log(nombreCuenta+"=="+strCuenta)
		if(strCuenta==nombreCuenta ) return cuentas[i]._id
	}
	return null;
}

function marcarOrdenFinalizada()
{
	var esSi=textoSalida.indexOf("si")!=-1;
	
	if(esSi){
		Meteor.call("ordenesTrabajo.marcarFinalizada",nroOrdenSeleccion,function(err,res){
			if(!err)
				pedir("Listo pa, algo mas?","solicitarTarea")
		else console.log(err)
			
		})
		// Entidades.insert(dataOrden)
		
	}
}
function finalizarPagoOrden()
{
		var esSi=textoSalida.indexOf("si")!=-1;
	var texto="Pago cargado, marcamos como finalizada?";
	console.log(datosPagoOrden)
	if(esSi){
		Meteor.call("ordenes.cargarPago",datosPagoOrden,function(err,res){
			if(!err){
				pedir(texto,"marcarOrdenFinalizada");
				nroOrdenSeleccion=datosPagoOrden.nroOrden;
			resetPagoOrden();
		}else err.reason.hablar()
			
		})
		// Entidades.insert(dataOrden)
		
	}
	else pedir("Que necesitas?",solicitarTarea)
}
function pideDatosPagoOrden()
{
	var importe=textoSalida.substring(0,textoSalida.indexOf("en"));
	var finFormaPago=textoSalida.indexOf("fecha")==-1?textoSalida.length:textoSalida.indexOf("fecha");
	var formaPago=textoSalida.substring(textoSalida.indexOf("en")+2,finFormaPago);
	var textoFecha=textoSalida.indexOf("fecha")==-1?"":textoSalida.substring(textoSalida.indexOf("fecha")+5);
	datosPagoOrden.importe=importe;
	datosPagoOrden.fecha=getFecha(textoFecha)
	datosPagoOrden.formaPago=formaPago;
	datosPagoOrden.idCuenta=getIdFormaPago(formaPago);
	console.log(datosPagoOrden)
	mostrar(datosPagoOrden,"nuevoPagoOrden")
	if(datosPagoOrden.idCuenta)pedir("Listo la cargamos?","finalizarPagoOrden")
	else pedir("No encontre la forma de pago.. decime de nuevo","pideDatosPagoOrden")
}
function ejecutarTarea()
{
	for(var i=0;i<comandos.length;i++)
		if(textoSalida.indexOf(comandos[i])!=-1){
			var Funcion=eval("ejecuta_"+comandos[i].replaceAll(" ",""));
			Funcion();
			return true;
		}
	return false;
}
function ejecuta_saldo()
{
	var entidad=texto.substring(texto.indexOf("saldo")+5).trim().toLowerCase();
	buscarEntidad(entidad,"","",function(){
		console.log(entidadSeleccion)
		Meteor.call("entidades.saldo",entidadSeleccion._id,function(err,res){
			console.log(res)

		})
	})
		
}
function ejecuta_buscar()
{
	var entidad=textoSalida.substring(textoSalida.indexOf("buscar")+6).trim();
	console.log("buscando:"+entidad)
	buscaEntidad(entidad,"solicitarTarea","si, que hacemos?");
}
function ejecuta_si()
{
	if(entidadValida())finalizarNuevaEntidad()
	if(ordenValida()) finalizarOrden()
}
function ejecuta_finalizar()
{
	if(entidadValida())finalizarNuevaEntidad()
	if(ordenValida()) finalizarOrden()
}
function getTotalPagos(pagos){
	var sum=0;
	if(pagos) for(var i=0;i<pagos.length;i++)sum+=pagos[i].importe;
	return sum;
}
function getMes(mesLetra)
{
	for(var i=0;i<meses.length;i++)
		if(meses[i]==mesLetra)return i+1;
	return null;
}
function getFecha(texto)
{
	console.log("texto fecha: ",texto)
	var fecha=new Date();
	if(texto=="")return new Date().fecha(1)
	var dia=texto.substring(0,texto.indexOf("de")).trim();
	var mes=getMes(texto.substring(texto.indexOf("de")+2).trim().toLowerCase());
	var strFecha=(new Date().getFullYear())+"/"+mes+"/"+(dia);
	console.log("FEHCA: ",strFecha)

	return new Date(strFecha).fecha(1)
}
function ejecuta_pagarorden()
{
	datosPagoOrden.nroOrden=Number(textoSalida.substring(textoSalida.indexOf("orden")+5).trim());
	
	var textoFecha=textoSalida.substring(textoSalida.indexOf("el")+2).trim()
	
	console.log(datosPagoOrden)
	Meteor.call("ordenesTrabajo.one",datosPagoOrden.nroOrden,function(err,res){
		if(res){
			datosPagoOrden.idOrdenTrabajo=res._id;
			var totalPagos=getTotalPagos(res.pagos);
			var importe=res.importe;
			var saldo=importe-totalPagos;
			console.log(res)
			pedir("Tiene un saldo de "+saldo+". Decime importe y forma de pago","pideDatosPagoOrden");
		}else{
			pedir("No encontre la orden, decime de nuevo","solicitarTarea");
		}
	})
	
}
function ejecuta_agregarentidad()
{
	pedir("Decime el nombre y telefono","pideDatosEntidad");
}
function ejecuta_agregarpersona()
{
	pedir("Decime el nombre y telefono","pideDatosEntidad");
}
function ejecuta_agregarpersonas()
{

	pedir("Decime el nombre y telefono","pideDatosEntidad");
}
function ejecuta_salir()
{
	
}
function ejecuta_agregargasto()
{
	var entidad=textoSalida.substring(textoSalida.indexOf("agregar gasto")+13).trim();
	if(entidad!="")buscaEntidad(entidad,"pideDatosGasto","Decime el importe y detalle");
}
function ejecuta_agregarorden()
{
	console.log("cargando orden");
	var entidad=textoSalida.substring(textoSalida.indexOf("agregar orden")+13).trim();
	if(entidad!="")buscaEntidad(entidad,"pideDatosOrden","Decime el detalle e importe");

}
function solicitarTarea()
{
	console.log("solicitarTarea: "+textoSalida)
	console.log(entidadSeleccion)
	if(ejecutarTarea()) return true;
	else pedir("No entendi, decime","solicitarTarea")
}

function ejecutaComando()
{
	var Comando=eval(tipoComando);
	if(Comando) Comando();
}
function mostrar(data,tipo)
{
	var salida;
	if(tipo=="entidades"){
		salida="Encontre las siguientes entidades:";
		if(data.length==1){
			salida="Lo encontre! <br>";''
			salida+="<h4><span class='entidadVoz'>"+data[0].razonSocial+"</span> <small>"+data[0].telefono+"</small></h4>";
			salida+="Que hacemos?(pronuncia lo que quieres) <span class='accionesVoz'>NUEVA ORDEN | NUEVO PAGO | ESTADO CUENTA </span>"
			return salida
		}else{  for(var i=0;i<data.length;i++)
			salida+="<h4 idEntidad='"+data[i]._id+"' class='entidadVoz'>"+data[i].razonSocial+" <small>"+data[i].telefono+"</small></h4> <br>";
		salida+=""
	}
	
		$("#"+contenedorSalida).html(salida) ;
		
		return;
	}
	if(tipo=="nuevaEntidad"){
		salida+="<h4><b>NOMBRES </b>"+data.razonSocial+" TELEFONO: "+data.telefono+"</h4>";
		salida+="Esta bien?"
		$("#"+contenedorSalida).html(salida) ;
		return;
	}
	if(tipo=="nuevoPagoOrden"){
		salida+="<h4><b>ORDEN </b>"+data.nroOrden+" IMPORTE: "+data.importe+" FORMA de PAGO: "+data.formaPago+"</h4>";
		salida+="Esta bien?"
		$("#"+contenedorSalida).html(salida) ;
		return;
	}
	if(tipo=="nuevaEntidad"){
		salida+="<h4><b>NOMBRES </b>"+data.razonSocial+" TELEFONO: "+data.telefono+"</h4>";
		salida+="Esta bien?"
		$("#"+contenedorSalida).html(salida) ;
		return;
	}
	if(tipo=="nuevaOrden"){
		salida+="<h4><b>ENTIDAD </b>"+entidadSeleccion.razonSocial+"<b>DETALLE </b>"+data.descripcionCliente+" IMPORTE: "+data.importe+"/h4>";
		salida+="Esta bien?"
		$("#"+contenedorSalida).html(salida) ;
		return;
	}
}

function buscaEntidad(salida,tareaEjecuta,pregunta,funcionEncuentra)
{
	
		//var entidad=salida.substring(salida.indexOf("buscar")+6).trim();
		console.log(salida)
		Meteor.call("entidades.find",salida,function(err,res){
			var texto="No lo tengo";
			var entidades=res;
			console.log(res)
			if(entidades.length==1){
				entidadSeleccion=entidades[0];
				mostrar(entidades,"entidades");
				if(funcionEncuentra){
					funcionEncuentra();
					return;
				}
				
				pedir(pregunta,tareaEjecuta);
				return;
			}
			entidadSeleccion=null;
			if(entidades.length>1)mostrarEntidades(entidades)
			if(entidades.length==0)texto.hablar()
	})
		
	  
}
function getTexto(event)
{
	var salida=""
	for (var i = event.resultIndex; i < event.results.length; i++) {
			if(event.results[i].isFinal)
				salida += event.results[i][0].transcript;
		    }
		    return salida.toLowerCase();
}
function getTextoParcial(event)
{
	var salida="";
	for (var i = event.resultIndex; i < event.results.length; i++) {
				salida = event.results[i][0].transcript;
		    }
		    return salida.toLowerCase();
}
function iniciarDetector()
{
		if (!('webkitSpeechRecognition' in window)) {
		alert("¡API no soportada!");
	} else {

		recognition = new webkitSpeechRecognition();
		recognition.lang = "es-VE";
		recognition.continuous = true;
		recognition.interimResults = true;

		recognition.onstart = function() {
			recognizing = true;
			console.log("empezando a escuchar");
		}
		recognition.onresult = function(event) {
			var salida=getTexto(event,true);
			//textoHabla+=getTextoParcial(event)
			SUIBlock.message.set(getTextoParcial(event));
			$("#textoReconoce").html(getTextoParcial(event));
			textoSalida=salida;
		
			
		}
		recognition.onerror = function(event) {
			var error=event.error=="not-allowed"?"Tiene que tener protocolo HTTPS el sitio, no puedo escucharte!":event.error;
			 SUIBlock.unblock();
			swal("Ops..",error,"error")
		}
		recognition.onend = function() {
			recognizing = false;
			console.log("terminó de escuchar, llegó a su fin");
			textoSalida=textoSalida.normalize('NFD').replace(/[\u0300-\u036f]/g,"");
			$( document.activeElement ).val(textoSalida);
			
			ejecutaComando();
			textoSalida="";
			tipoComando="";
			textoHabla="";

		}

	}
}
	


	function iniciarReconocimientoVoz(comando) {
		 SUIBlock.block("TE ESCUCHO");
			tipoComando=comando;
			textoSalida="";
			recognition.start();
			recognizing = true;
		 
		
	}
	function detenerReconocimientoVoz() {
			 SUIBlock.unblock();
			recognition.stop();
			recognizing = false;
		
	}
	
function keyDownTextField(e) {
var keyCode = e.keyCode;

  if(keyCode==113)pedir("Bien, decime","solicitarTarea")

  	
  if(keyCode==13) detenerReconocimientoVoz();
}
//ejecutaComando("nueva orden para novillo trajo una pc parece que está bastante mal")	