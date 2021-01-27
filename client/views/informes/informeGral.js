var totalGral=function(ano,mes,estado,agrupa)
{
  UIBlock.block('Consultando datos, aguarde un momento...');
  Meteor.call("totalGral",ano,mes,estado,agrupa,function(err,res){
      Session.set("itemsSeleccion",res);
     	UIBlock.unblock();
    });
}
var consultarDetalleMes=function(mes)
{
var ano=$("#anoSeleccion").val()*1;
  UIBlock.block('Consultando datos del mes, aguarde un momento...');
  Meteor.call("totalGral",ano,mes,null,false,function(err,res){
      Session.set("itemsSeleccion",res);
     	UIBlock.unblock();
    });
}
var consultarMeses=function(){
  Meteor.call("mensualGral",Number($("#anoSeleccion").val()),null,true,function(err,res){
      Session.set("resultadoMesesGral",res);
 
      	UIBlock.unblock();
    });
}
var consultarMorosos=function(){
  Meteor.call("consultaMorososGral",function(err,res){
  console.log("morosos:")
   console.log(res)
      Session.set("itemsMorosos",res);

      	UIBlock.unblock();
    });
}

var consultarTotalesAno=function()
{
  UIBlock.block('Consultando datos, aguarde un momento...');
  Meteor.call("totalGral",Session.get("anoSeleccion"),null,null,true,function(err,res){
      Session.set("totalGral",res);
      consultarMeses();
    });
}
Template.cadaDeudor.helpers({
"cliente":function(){
console.log(this)
if(this.entidad)
if(this.entidad.length>0)return this.entidad[0].razonSocial;
},

"telefono":function(){
console.log(this)
if(this.entidad)
if(this.entidad.length>0)return this.entidad[0].telefono;
},
})
Template.detalleMesVentas.helpers({
  "tituloMes":function(){
    return(Session.get("mesSeleccion").mesLetras);
  },
  "tituloDia":function(){
    return(Session.get("diaSeleccion").dia)+" "+(Session.get("diaSeleccion").diaLetras);
  },
})
Template.informeGral.helpers({
  "meses":function(){
   
    return Session.get("resultadoMesesGral")
  },
  "dias":function(){
   
    return Session.get("diasMes")
  },
  "anoSeleccion":function(){
    return Session.get("anoSeleccion");
  },
  "totalMes":function(){
  var sum=0;
  var arr=Session.get("itemsSeleccion");
   for(var i=0;i<arr.length;i++) sum+=arr[i].importe;
    
  
  return sum;
  },
  "totalSaldo":function(){
var arr=Session.get("itemsMorosos");
var sum=0;
 for(var i=0;i<arr.length;i++) sum+=arr[i].importeSaldo;
 return sum.formatMoney();
},
  "mesSeleccion":function(){
    return Session.get("mesSeleccion");
  },
  "itemsSeleccion":function(){
    return Session.get("itemsSeleccion");
  },
   "itemsMorosos":function(){
    return Session.get("itemsMorosos");
  },
  "claseTotalAno":function(){
   
   if(Session.get("totalGral")!==null)return "label-primary";
    return "label-default";
  },
  
  "totalAno":function(){
    
    if(Session.get("totalGralAnual")===null)return 0;
    return  Session.get("totalGralAnual")[0].toFixed(2);
  },
});
Template.informeGral.onRendered(function(){
  var d=new Date();
   Session.set("anoSeleccion",d.getFullYear());
  consultarTotalesAno();
});

Template.cadaMesGral.helpers({
  "mes":function(){
    return(this.mes.mesLetras);
  },
   
  "totalMes":function(){
   
    if(this.mes.data!==null)return this.mes.data.formatMoney();
    return 0;
  },
  "claseTotalMes":function(){
   
    if(this.mes.data!==null)return "label-primary";
    return "label-default";
  },
  
});



Template.informeGral.events({
  "click .mesSeleccion":function(){
  Session.set("mesSeleccion",this.mes);
    Session.set("detalleDiasMes",[]);
   consultarDetalleMes(this.mes.mes); //true es que es default
   //consultarMorosos();
  },
  "click #imprimir":function(){
    import "/public/importar/printThis.js";
    $("#printArea").printThis({importCss:true,header:getHeader("DETALLE DE CAERNETS"," automaticos")})
  },
   "click #buscarGral":function(){
   console.log("cons?")
    Session.set("detalleDiasMes",[]);
   consultarDetalleMes( Session.get("mesSeleccion")); //true es que es default
   //consultarMorosos();
  },
  "click #buscarDeudores":function(){
   consultarMorosos()
  },
  
   "change #anoSeleccion":function(){
     Session.set("anoSeleccion",Number($("#anoSeleccion").val()));
   consultarTotalesAno();
  }
});