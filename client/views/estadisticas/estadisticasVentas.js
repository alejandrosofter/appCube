
window.chartColors = {
	red: 'rgb(255, 99, 132)',
	orange: 'rgb(255, 159, 64)',
	yellow: 'rgb(255, 205, 86)',
	green: 'rgb(75, 192, 192)',
	blue: 'rgb(54, 162, 235)',
	purple: 'rgb(153, 102, 255)',
	grey: 'rgb(231,233,237)'
};
var getColorSemana=function(semana){
  if(semana===1)return 'rgb(54, 162, 235)';
   if(semana===2)return 'rgb(255, 159, 64)';
   if(semana===3)return 'rgb(75, 192, 192)';
   if(semana===4)return 'rgb(255, 99, 132)';
  return "rgb(231,233,237)";
};
var crearChartPie=function(lab,datos,eti,colors){
 // var Chart = require('chart.js')
  var ctx = document.getElementById(lab).getContext("2d");
    var randomScalingFactor = function() {
        return Math.round(Math.random() * 100);
    };
    var config = {
        type: 'doughnut',
        data: {
            datasets: [{
                data: datos,
							  backgroundColor:colors,
                label: 'Dataset 1'
            }],
            labels: eti
        },
        options: {
            responsive: true,
					tooltips:{
						enabled:true,
						
					},
					  animation:{ animateScale:true  }
        }
    };
   return new Chart(ctx, config);
}
var crearChartBubble=function(lab){
 // var Chart = require('chart.js')
  var ctx = document.getElementById(lab).getContext("2d");
   var data = {
    datasets: [
        {
            label: 'SEMANA UNO',
            data: [
                {
                    x: 20,
                    y: 30,
                    r: 15
                },
                {
                    x: 40,
                    y: 10,
                    r: 10
                }
            ],
            backgroundColor:getColorSemana(1),
        },
       {
            label: 'SEMANA DOS',
            data: [
                {
                    x: 20,
                    y: 30,
                    r: 15
                },
                {
                    x: 40,
                    y: 10,
                    r: 10
                }
            ],
            backgroundColor:getColorSemana(2),
        },
       {
            label: 'SEMANA TRES',
            data: [
                {
                    x: 42,
                    y: 1,
                    r: 15
                },
                {
                    x: 4,
                    y: 120,
                    r: 1
                }
            ],
            backgroundColor:getColorSemana(3),
        },
       {
            label: 'SEMANA CUATRO',
            data: [
                {
                    x: 3,
                    y: 6,
                    r:35
                },
                {
                    x: 40,
                    y: 10,
                    r: 10
                }
            ],
            backgroundColor:getColorSemana(4),
        }
    
    
    ]
};
    
   return new Chart(ctx,{
    type: 'bubble',
    data: data,
   options: {
        elements: {
            points: {
                borderWidth: 1,
                borderColor: 'rgb(0, 0, 0)'
            }
        }
    }
});
}

Template.estadisticaVentas.rendered= function() {
 // crearChartPie("pieSemana");
 // crearChartBubble("puntoSemana");
 
};
var getMes=function(mes){
	if(mes==1)return "Enero";
		if(mes==2)return "Febrero";
		if(mes==3)return "Marzo";
		if(mes==4)return "Abril";
		if(mes==5)return "Mayo";
		if(mes==6)return "Junio";
		if(mes==7)return "Julio";
		if(mes==8)return "Agosto";
		if(mes==9)return "Septiembre";
		if(mes==10)return "Octubre";
		if(mes==11)return "Noviembre";
		if(mes==12)return "Diciembre";
	return "?";
}
var getColorMes=function(mes){
	if(mes==1)return "#a93b3b";
		if(mes==2)return "#a9873b";
		if(mes==3)return "#a2a93b";
		if(mes==4)return "#65a93b";
		if(mes==5)return "#3ba958";
		if(mes==6)return "#3ba985";
		if(mes==7)return "#3ba4a9";
		if(mes==8)return "#3b71a9";
		if(mes==9)return "#3b49a9";
		if(mes==10)return "#843ba9";
		if(mes==11)return "#a93b96";
		if(mes==12)return "#a93b4f";
	return "?";
}
var consultaDatos =function(ano,mes){
	anual.clear();
	Meteor.call("getTotalAnoVentas",ano,function(err,res){
		var labs=[];
		var valores=[];
		var color=[];
		$(res).each(function(ind,val){
			anual.push(val);
			labs.push(getMes(val._id));
			color.push(getColorMes(val._id));
			valores.push(val.total);
		});
		crearChartPie("pieSemana",valores,labs,color);
		console.log(anual.array());
	});
};
var consultar=function(){
	var ano=$("#ano").val()*1;
	var mes=Session.get("mesSeleccion");
	console.log("consultando");
	consultaDatos(ano,mes);
};

Template.mesEstadistica.helpers({
	"mesLetras":function(){
		return getMes(this.mes);
	},
	"total":function(){
		return this.total.toFixed(2);
	},
})
Template.semana.helpers({
	"importeEfectivo":function(){
		if(this.doc.length>0)return this.doc[0].totalEfectivo.toFixed(2);
	return 0;
	},
	"importeDebito":function(){
		if(this.doc.length>0)return this.doc[0].totalDebito.toFixed(2);
	return 0;
	},
	"importeCredito":function(){
		if(this.doc.length>0)return this.doc[0].totalCredito.toFixed(2);
	return 0;
	},
	"importeTotal":function(){
		if(this.doc.length>0)return this.doc[0].total.toFixed(2);
	return 0;
	},
	"cantidad":function(){
		console.log(this);
	},
	"nroSemana":function(){
		return this.nroSemana;
	},
});
Template.detalleMes.helpers({
	"items":function(){
		return this.items;
	},
	"mes":function(){
		return this.mes;
	},
	"total":function(){
		console.log(this);
		return this.total.toFixed(2);
	},
});
Template.itemsVentaEstadistica.helpers({
	"detalle":function(){
		return this.doc.nombreProducto;
	},
"cantidad":function(){
		return this.doc.cantidad;
	},
	"importe":function(){
		return this.doc.precioVenta.toFixed(2);
	},
	"idFila":function(){
		return this.idFila;
	},
});
Template.filaDetalleMes.helpers({
	"fecha":function(){
	 var d=new Date(this.fecha);
           return d.toLocaleDateString()+ ' ' + d.toLocaleTimeString();
	},
	"nombreEntidad":function(){
		var entidad=Entidades.findOne({_id:this.idEntidad});
		return entidad.razonSocial;
	},
	"importe":function(){
		return this.importe.toFixed(2);
	},
	"idFilaDetalle":function(){
		
		return this._id;
	},
	"items":function(){
		
		return this.items;
	},
});
Template.filaDetalleMes.events({
	'click .filaMes': function(ev) {
		$(".filaDetalleEstadistica").hide();
		
		var id=this._id;
		$("#"+id).show();
		//MARCO FILA SELECCION
		$(".filaMes").removeClass("seleccionFilaDetalle");
		var a=$(ev.currentTarget);
		console.log(ev);
		a.addClass("seleccionFilaDetalle");
	}
});
Template.estadisticaVentas.helpers({
  "colorSemana":function(semana){
    return getColorSemana(semana);
  },
	"items":function(){
		return anual.array();
	},
  "getMes":function(){
  var fecha=new Date();
    return fecha.getMonth();
  },
  "anoActual":function(){
  var fecha=new Date();
    return fecha.getFullYear();
  },
 
   "semana1":function(){
    console.log(semana1.get());
		return semana1.get();
  },
	 "semana2":function(){
    	console.log(semana2.get());
		return semana2.get();
  },
	 "semana3":function(){
    	console.log(semana3.get());
		return semana3.get();
  },
	 "semana4":function(){
    	console.log(semana4.get());
		return semana4.get();
  },
  
  "cantidad":function(){
    
  },
	"importe":function(){
	return 0;
  },"importeTotal":function(){
	return 0;
  }
  
});

Template.estadisticaVentas.created = function() {
	anual = new ReactiveArray();
	dias = new ReactiveArray();
	consultar();
};
Template.estadisticaVentas.events({
  'click .mes': function(ev) {
   var a=$(ev.currentTarget);
		
		var aux=this;
    Modal.show('detalleMes',function(){
			var mes=a.attr("value")*1;
			var ano=$("#ano").val()*1;
			
			var proxMes=mes==12?1:(mes+1);
			var proxAno=mes==12?(ano+1):ano;
			var desde=new Date(ano+"-"+mes+"-01 00:00:00");
			var hasta=new Date(proxAno+"-"+proxMes+"-01 00:00:00");
			var res=Ventas.find({fecha:{$gte:desde,$lt:hasta}},{sort:{fecha:-1}}).fetch();
			return {mes:a.context.text,items:res,total:aux.total};
		});
  },
	 'click #buscar': function(ev) {
   var a=$(ev.currentTarget);
   Session.set("mesSeleccion",(a.attr("value")*1));
		consultar();
  },
});