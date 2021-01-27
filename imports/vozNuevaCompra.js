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
  
var textoHabla="";

init();
function cargarItemNuevaCompra(texto)
{
	var arrTexto=texto.split(" ");
			var importe=(texto.substring(texto.indexOf("importe")+7).trim());
			if(importe.indexOf("con")!=-1){
				//TIENE DECIMALES
				var decimales=importe.substring(importe.indexOf("con")+3);
				var entero=importe.substring(0,importe.indexOf("con"));
				importe=entero.trim()+"."+decimales.trim();
			}
			texto=texto.substring(0,texto.indexOf("importe"));//BORRO IMPORTE PARA LIMPIAR
			console.log("quito  importe",texto);
			var textoCantidad=texto.substring(texto.indexOf("cantidad"),texto.indexOf("cantidad")+12);
			console.log("text cant",textoCantidad);
			var cantidad="1";
			if(textoCantidad.indexOf("cantidad") != -1){
				cantidad=textoCantidad.split(" ")[1];
				texto=texto.replaceAll(textoCantidad,"");
			}
			
			console.log("quita",texto)
			var detalle=texto.trim();
			var total=Number(cantidad)*Number(importe)
			var aux={importe:importe,total:String(total),referencia:"",codigo:"",porcentajeDescuento:"0",idProducto:"0",cantidad:cantidad,detalle:detalle};
			console.log(aux)
			agregarItem(aux)
}
function init()
{
$( document ).ready(function() {
    iniciarDetector();
	//setTimeout(function(){mostrarComandos()},4000);
	document.addEventListener("keydown", keyDownTextField, false);
	$( ".entidadVoz" ).on( "click", function() { console.log(ev,this) });
	//cargarItemNuevaCompra("cantidad 22 rosaca de media importe 460 con 45")
});
	
	

}
function mostrarComandos(){
	
	var sal="Los comandos disponibles son: <br>";
	for(var i=0;i<comandos.length;i++)
		sal+="<h5>"+comandos[i]+"</h5>"
	console.log(sal)
	$("#comandos").html(sal)
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
	console.log("detector inicndo")
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
			//$("#textoReconoce").html(getTextoParcial(event));
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
			cargarItemNuevaCompra(textoSalida)
			

		}

	}
}
	


	function iniciarReconocimientoVoz(comando) {
		 SUIBlock.block(new Spacebars.SafeString("FORMA DE LA FRASE: '<big><big><b>CANTIDAD</b> cinco bolsa de harina 3 ceros <b>IMPORTE</b> 455</big></big>' o sin cantidad deduce que es solo una uniddad '<big><big>bolsa de harina 3 00 <b>IMPORTE</b> 455</big></big>'"));
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
function pedir(texto,comando)
{
	texto.hablar();
	var tiempo=texto.length*95;
	setTimeout(function(){iniciarReconocimientoVoz(comando)},tiempo);
	
}
function keyDownTextField(e) {
var keyCode = e.keyCode;

  if(keyCode==113)pedir("Bien, decime","solicitarTarea")

  	
  if(keyCode==13) detenerReconocimientoVoz();
}
//ejecutaComando("nueva orden para novillo trajo una pc parece que está bastante mal")
