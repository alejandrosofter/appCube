import { Meteor } from 'meteor/meteor';
import { Promise } from 'meteor/promise';
import { Future } from 'fibers/future';

// Images.allow({
//   'insert': function () {
//     // add custom authentication code here
//     return true;
//   }
// });
var seting=Settings.findOne({clave:"cadenaConexionMail"});
import "./consultas.js";
if(seting) process.env.MAIL_URL=seting.valor;
//DATOS DE LA BASE DE DATOS!!!!//////////////////////////////////////////////////////////////////////////
	nombreBase="meteor";
puertoBase="3001";
//DATOS DE LA BASE DE DATOS!!!!//////////////////////////////////////////////////////////////////////////
  

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
Meteor.startup(() => {
  

	 Meteor.publish('Equipos', function(idUsuario){
		 console.log("consultando:"+idUsuario)
    return Equipos.find({idUsuario:idUsuario});
});
   Meteor.publish('Settings', function(){
    return Settings.find();
});
  
 
});
