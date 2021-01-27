
mesLetras=function(mes)
{
  if(mes==1)return "ENERO";
  if(mes==2)return "FEBRERO";
  if(mes==3)return "MARZO";
  if(mes==4)return "ABRIL";
  if(mes==5)return "MAYO";
  if(mes==6)return "JUNIO";
  if(mes==7)return "JULIO";
  if(mes==8)return "AGOSTO";
  if(mes==9)return "SEPTEMBRE";
  if(mes==10)return "OCTUBRE";
  if(mes==11)return "NOVIEMBRE";
  if(mes==12)return "DICIEMBRE";
  return "s/a";
}
function getEquipo(nroSerie){
	return Equipos.findOne({nroSerie:nroSerie});
}
Meteor.methods({
	"actualizarEquipo":function(nroSerie)
	{
		var equipo=getEquipo(nroSerie);
		var obj={fecha:new Date(),accion:"actualizarEquipo",detalle:"Actualizar",estado:"PENDIENTE",data:""};
		Equipos.update({_id:equipo._id},{$push:{tareas:obj}});
	},
	"equipos.saldarTarea":function(idTarea,nroSerie)
	{
		var equipo=getEquipo(nroSerie);
		Equipos.update(
			{_id:equipo._id,"tareas._id":idTarea},
			{$set:{"tareas.$.estado":"CANCELADO"}},
			{ getAutoValues: false }
			)
	},
	"equipos.getTareas":function(nroSerie){
		var equipo=getEquipo(nroSerie);
		console.log(nroSerie);
		return JSON.stringify(equipo.tareas)
	},
	"agregarTarea":function(data){
		var dataEquipo={claveRed:data.claveRed,ssid:data.ssid,claveCube:data.claveCube};
	var obj={fecha:new Date(),accion:"modificaEquipo",detalle:"Modifica Equipo",estado:"PENDIENTE",data:JSON.stringify(dataEquipo)};
	Equipos.update({_id:data._id},{$push:{tareas:obj}});
	// var tareas=Equipos.findOne({_id:data._id}).tareas;
	Equipos.update({_id:data._id},{$set:{tareas:[]}});
	},

	"eventos.nuevo":function(nroSerie,fecha,tipoEvento,valor){
		var equipo=getEquipo(nroSerie);
		var evt={fecha:fecha,tipoEvento:tipoEvento,valor:valor};
		Equipos.update({_id:equipo._id},{$push:{eventos:evt}});
		return "buenaa!"
	},

	"generarVariables":function()
	{
		//Settings.remove({});
		if(!Settings.findOne({clave:"condicionIvaEmpresa"})) Settings.insert({clave:"condicionIvaEmpresa",valor:"Monot."});
		if(!Settings.findOne({clave:"recargoTarjeta"})) Settings.insert({clave:"recargoTarjeta",valor:"20"});
		if(!Settings.findOne({clave:"redondeaDecena"})) Settings.insert({clave:"redondeaDecena",valor:"10"});
		
		if(!Settings.findOne({clave:"coeficienteProductos"})) Settings.insert({clave:"coeficienteProductos",valor:"10"});
		if(!Settings.findOne({clave:"tipoSistema"})) Settings.insert({clave:"tipoSistema",valor:"comercio"});
		if(!Settings.findOne({clave:"contactos"})) Settings.insert({clave:"contactos",valor:"Tel.xxxxxx email:xxxx"});
		
		if(!Settings.findOne({clave:"sizeThumbailProductos"})) Settings.insert({clave:"sizeThumbailProductos",valor:"50x50"});
		if(!Settings.findOne({clave:"simulaFacturaElectronica"})) Settings.insert({clave:"simulaFacturaElectronica",valor:"SI"});
		
		if(!Settings.findOne({clave:"vtoElectronicaSimula"})) Settings.insert({clave:"vtoElectronicaSimula",valor:"10/05/2020"});
		if(!Settings.findOne({clave:"nroElectronicaSimula"})) Settings.insert({clave:"nroElectronicaSimula",valor:"1"});
		if(!Settings.findOne({clave:"caeElectronicaSimula"})) Settings.insert({clave:"caeElectronicaSimula",valor:"232432423423423"});
		
		if(!Settings.findOne({clave:"cuitEmpresa"}))Settings.insert({clave:"cuitEmpresa",valor:"xxxxxxxxxx"});
		if(!Settings.findOne({clave:"certificado_fe"}))Settings.insert({clave:"certificado_fe",valor:"certificado_fe",muchaData:true});
		if(!Settings.findOne({clave:"pedido_fe"}))Settings.insert({clave:"pedido_fe",valor:"pedido_fe",muchaData:true});
		if(!Settings.findOne({clave:"privada_fe"}))Settings.insert({clave:"privada_fe",valor:"privada_fe",muchaData:true});
		if(!Settings.findOne({clave:"nombreEmpresa"}))Settings.insert({clave:"nombreEmpresa",valor:"Su empresa"});
		if(!Settings.findOne({clave:"domicilioEmpresa"}))Settings.insert({clave:"domicilioEmpresa	",valor:"s/e"});
		if(!Settings.findOne({clave:"fechaInicioEmpresa"}))Settings.insert({clave:"fechaInicioEmpresa",valor:"xx/xx/xxxx"});
		if(!Settings.findOne({clave:"ingresosBrutosEmpresa"}))Settings.insert({clave:"ingresosBrutosEmpresa",valor:"xxxxxx"});
		if(!Settings.findOne({clave:"interesCredito"}))Settings.insert({clave:"interesCredito",valor:"0"});
		if(!Settings.findOne({clave:"interesDebito"}))Settings.insert({clave:"interesDebito",valor:"0"});
		if(!Settings.findOne({clave:"proximoNroOrden"}))Settings.insert({clave:"proximoNroOrden",valor:"0"});
	if(!Settings.findOne({clave:"logoEmpresa"}))Settings.insert({clave:"logoEmpresa",valor:"-",muchaData:true});
	
	if(!Settings.findOne({clave:"mercadoPago_token"}))Settings.insert({clave:"mercadoPago_token",valor:"-"});
	
	if(!Settings.findOne({clave:"mercadoPago_access"}))Settings.insert({clave:"mercadoPago_access",valor:"-"});
	if(!Settings.findOne({clave:"muestraImpresionCargaOrden"}))Settings.insert({clave:"muestraImpresionCargaOrden",valor:"1"});
		
		if(!Settings.findOne({clave:"rangoPrecios"}))Settings.insert({clave:"rangoPrecios",valor:"0 a 1000000=42;"});
		if(!Settings.findOne({clave:"redondeo"}))Settings.insert({clave:"redondeo",valor:"2"});
		if(!Settings.findOne({clave:"normasServicio"}))Settings.insert({clave:"normasServicio",valor:"-"});
		if(!Settings.findOne({clave:"emailEnvio"}))Settings.insert({clave:"emailEnvio",valor:"USUARIO@HOST.XXX.XX"});
		if(!Settings.findOne({clave:"cadenaConexionMail"}))Settings.insert({clave:"cadenaConexionMail",valor:"smtp://USUARIO%40gmail.com:CLAVE@smtp.gmail.com:465/"});
	},
	

  "users.perfil"(id)
  {
    return Meteor.users.findOne({_id:id}).profile;
  },
  'users.list'(data) {
    return Meteor.users.find().fetch(); 
  },
  
  'users.one'(id) {
    return Meteor.users.find({_id:id}); 
  },
  'users.add'(usuario,clave,perfil) {
  	return Accounts.createUser({ username:usuario, password:clave, profile: perfil });
  },
  'users.update'(_id,usuario,perfil) {
  	return Meteor.users.update({_id:_id},{$set:{profile:perfil,username:usuario}});
  },
  'users.remove'(_id) {
  	return Meteor.users.remove({_id:_id});
  }, 
  'users.resetPassword'(_id,clave) {
  	return Accounts.setPassword(_id,clave);
  },
  

 "loginUser": function(data) {
   // Meteor.call('loginUser',{email: "vxxxxx@xxxx.com",password: "123456"}, function(error, result){
  //      if(!error) Meteor.loginWithToken(result.token);
   // });
       console.log(data);
       var user = Meteor.users.findOne({
         'emails.address': data.email
       });
       if (user) {
         var password = data.password;
         var result = Accounts._checkPassword(user, password);
         console.log(result);
         if (result.error) {
           return result.error;
         } else {
           return result;
         }
       } else {
         return {
           error: "user not found"
         }
       }
     }
});
