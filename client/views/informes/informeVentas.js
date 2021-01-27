var totalVentas=function(ano,mes,estado,agrupa)
{
  UIBlock.block('Consultando datos, aguarde un momento...');
  Meteor.call("totalVentas",ano,mes,estado,agrupa,function(err,res){
      Session.set("itemsSeleccionVentas",res);
    console.log(res);
     	UIBlock.unblock();
    });
}
var consultarDetalleMes=function(mes,tipo)
{
  UIBlock.block('Consultando datos, aguarde un momento...');
  Meteor.call("totalVentas",Session.get("anoSeleccion"),mes,null,null,function(err,res){
      Session.set("itemsSeleccionVentas",res);
    console.log(res);
     	UIBlock.unblock();
    });
}
var consultarMeses=function(){
  Meteor.call("mensualVentas",Number($("#anoSeleccion").val()),null,true,function(err,res){
      Session.set("resultadoMeses",res);
      	UIBlock.unblock();
    });
}
var consultarDias=function(mes){
  console.log("consultando dias")
  Meteor.call("mensualVentasDia",Number($("#anoSeleccion").val()),mes,true,function(err,res){
    console.log(res)
      Session.set("diasMes",res);
      	UIBlock.unblock();
    });
}
var consultarDetalleDias=function(mes){
   UIBlock.block('Consultando datos, aguarde un momento...');
  Meteor.call("totalVentasDias",Number($("#anoSeleccion").val()),mes,Session.get("diaSeleccion").dia,false,function(err,res){
    console.log(res)
      Session.set("detalleDiasMes",res);
      	UIBlock.unblock();
    });
}
var consultarTotalesAno=function()
{
  UIBlock.block('Consultando datos, aguarde un momento...');
  Meteor.call("totalVentas",Session.get("anoSeleccion"),null,null,true,function(err,res){
      Session.set("totalVentas",res);
      consultarMeses();
    });
}
Template.detalleMesVentas.helpers({
  "tituloMes":function(){
    return(Session.get("mesSeleccion").mesLetras);
  },
  "tituloDia":function(){
    return(Session.get("diaSeleccion").dia)+" "+(Session.get("diaSeleccion").diaLetras);
  },
})
Template.informeVentas.helpers({
  "meses":function(){
   
    return Session.get("resultadoMeses")
  },
  "dias":function(){
   
    return Session.get("diasMes")
  },
  "anoSeleccion":function(){
    return Session.get("anoSeleccion");
  },
  "mesSeleccion":function(){
    return Session.get("mesSeleccion");
  },
  "itemsSeleccion":function(){
    return Session.get("detalleDiasMes");
  },
  "claseTotalAno":function(){
   
   if(Session.get("totalVentas")!==null)return "label-primary";
    return "label-default";
  },
  
  "totalAno":function(){
    
    if(Session.get("totalVentas")===null)return 0;
    return  Session.get("totalVentas")[0].total.toFixed(2);
  },
});
Template.informeVentas.onRendered(function(){
  var d=new Date();
   Session.set("anoSeleccion",d.getFullYear());
  consultarTotalesAno();
});
Template.cadaDiaVentas.helpers({
  "dia":function(){
    return  new Spacebars.SafeString(this.dia.dia+" <i><small>"+this.dia.diaLetras+"</small></i>");
  },
  "totalDia":function(){
    if(this.dia.data!==null)return this.dia.data[0].importe.formatMoney();
    return 0;
  },
  "formaPagoDia":function(){
    console.log(this)
    var res="";
    if(this.dia.dataFormaPago)
    for(var i=0;i<this.dia.dataFormaPago.length;i++){
      var clase="";
      if(this.dia.dataFormaPago[i]._id==="EFECTIVO")clase="default";
      if(this.dia.dataFormaPago[i]._id==="DEBITO")clase="success";
      if(this.dia.dataFormaPago[i]._id==="CREDITO")clase="danger";
      res+='<span class="label label-'+clase+'">'+" $"+this.dia.dataFormaPago[i].importe.formatMoney()+"</span>"
    
    }
      
    return new Spacebars.SafeString(res);
  },
  "claseTotalDia":function(){
   
    if(this.dia.data!==null)return "label-primary";
    return "label-default";
  },
   "claseDiaSemana":function(){
   
    if(this.dia.diaLetras=="Domingo")return "claseBajaDia";
    return "";
  },
  
});
Template.cadaMesVentas.helpers({
  "mes":function(){
    return(this.mes.mesLetras);
  },
   
  "totalMes":function(){
   
    if(this.mes.data!==null)return this.mes.data[0].total.formatMoney();
    return 0;
  },
  "claseTotalMes":function(){
   
    if(this.mes.data!==null)return "label-primary";
    return "label-default";
  },
  
});
Template.filaDetalleMesSeleccionVentas.helpers({
  "cliente":function(){
  if(this.entidad.length>0)return this.entidad[0].razonSocial;
  return "s/n"
  },
   "fecha":function(){
   var d=new Date(this.fecha);
     return d.toLocaleDateString()+" "+d.toLocaleTimeString();
  },
  "importeDet":function(){
   return this.importe.toFixed(2)
  },
  "detalle":function(){
    var sal="";
    if(this.items)
   for(var i=0;i<this.items.length;i++){
     var aux=this.items[i];
     sal+=aux.nombreProducto+" | "
   }
    return sal
  },
   "imagenSocio":function(){
    if(this.imagen===null) return "-"
     return  new Spacebars.SafeString("<img style='width:70px' class='img-circle' src='"+this.imagen[0].data+"' title='"+this.imagen[0].descripcion+"' />");
  },
  
})
Template.cadaDiaVentas.events({
  "click .diaSeleccion":function(){
 
    Session.set("diaSeleccion",this.dia)
    consultarDetalleDias(Session.get("mesSeleccion").mes);
  },
});
Template.informeVentas.events({
  "click .mesSeleccion":function(){
  Session.set("mesSeleccion",this.mes);
    Session.set("detalleDiasMes",[]);
   consultarDias(Session.get("mesSeleccion").mes);
//     consultarDetalleMes(this.mes.mes,true); //true es que es default
  },
  "click #imprimir":function(){
    import "/public/importar/printThis.js";
    $("#printArea").printThis({importCss:true,header:getHeader("DETALLE DE CAERNETS"," automaticos")})
  },
  
   "change #anoSeleccion":function(){
     Session.set("anoSeleccion",Number($("#anoSeleccion").val()));
   consultarTotalesAno();
  }
});