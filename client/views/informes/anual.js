var consultarData=function()
{
	Meteor.call("informeAnual",$("#anoSeleccion").val(),function(err,res){
		instanciarChart2(ripData(res));
	});
}
var ripDataItems=function(data)
{
    var sal=[];
    for(var i=0;i<data.length;i++){
        var aux=data[i];
        aux._id=String((i*1)+1000);
        sal.push(aux);
    }
    return sal;
}
var consultarPagosMes=function(ano,mes,agrupa,centroCosto)
{
    Meteor.call("consultarPagosMesArea",Session.get("tipo"),ano,mes,agrupa,centroCosto,function(err,res){
        console.log(res);
        Session.set("dataInforme_mensual",ripDataItems(res));
    });
}
var ripData=function(data)
{
    var arr=[['Mes', 'Ordenes de Trabajo', 'Compras', 'Ventas']];
    for(var i=1;i<=12;i++)
        arr.push([getMes(i),data.ordenes[(i-1)],data.compras[(i-1)],data.ventas[(i-1)]]);
    return arr;
}
var getMes=function(mes)
{
    var meses= ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return meses[(mes-1)];
}
var arrColor=function(col)
{
	var data=[]
	for(var i=0;i<=11;i++)data.push(col)
		return data;
}
var chart=null;
var datos=[];
var instanciarChart2=function(dataArr)
{
     google.charts.load('current', {'packages':['bar']});
    datos=dataArr;
      // Set a callback to run when the Google Visualization API is loaded.
      google.charts.setOnLoadCallback(drawChart);

      // Callback that creates and populates a data table,
      // instantiates the pie chart, passes in the data and
      // draws it.
      
}
var abrirVentana=function(mes,col)
{
    var data={tipo:col,mes:mes,ano:($("#anoSeleccion").val()*1)};
     Modal.show("datosAnual",function(){ return data});
     $("#datosAnualModal").on("hidden.bs.modal", function () { $('body').removeClass('modal-open');  $('.modal-backdrop').remove();});
             
}
var drawChart=function() {

        // Create the data table.
        console.log(datos);
         var data = google.visualization.arrayToDataTable(datos);
        // Set chart options
        var options = {
          chart: {
            title: 'Performance',
            subtitle: 'Estado ANUAL DE EMPRESA',
          },
          vAxis:{ format:"currency"},
          bars: 'vertical' // Required for Material Bar Charts.
        };

        // Instantiate and draw our chart, passing in some options.
        var chart = new google.charts.Bar(document.getElementById('chart_div'));
        google.visualization.events.addListener(chart, 'select', function() {
        var selectedItem = chart.getSelection()[0];
            if (selectedItem) {
                var mes=selectedItem.row+1;
                var col=selectedItem.column;
                console.log("Mes "+mes);
               abrirVentana(mes,col);
            }
        });

        chart.draw(data, google.charts.Bar.convertOptions(options));
      }

Template.datosAnual.helpers({
    "nombreMes":function(){
        return getMes(this.mes)
    },
    'settings': function(){
      var items=this.items;
        return {
 collection: Session.get("dataInforme_mensual"),
 rowsPerPage: 100,
          showNavigationRowsPerPage:false,
 class: "table table-condensed",
 showFilter: false,
 fields: [
    {
        key: 'fecha',
        label: 'FECHA',
     headerClass: 'col-md-1',
     fn:function(value,obj){
        return moment(value).format("DD/MM/YYYY")
    }
   
      },
   {
        key: 'detalle',
        label: 'Detalle',
        fn:function(value,obj){
            if(obj.tipo=="Ventas")return (value[0].nombreProducto+" $"+value[0].precioVenta);
            if(obj.tipo=="Compras")return (value[0].detalle+" $"+value[0].total);
        return value;
        }
      },
       {
        key: 'idCentroCosto',
        label: 'C.C',
        headerClass: 'col-md-1',
        fn:function(val,obj){
            var cc=CentroCostos.findOne({_id:val});
            if(cc)return cc.nombreCentroCosto;
            return "s/n"
        }
   
      },
   {
        key: 'tipo',
        label: 'Tipo',
   
  },
  
   { 
        key: 'importe',
        label: '$ Importe',
        headerClass: 'col-md-2',
        fn: function (value, object, key) {
          return value.formatMoney(2,".")
         }
   },
   {
        label: '',
        headerClass: 'col-md-2',
        tmpl:Template.accionesInformeAnual
      }
 
 ]
 };
    }
});
Template.accionesInformeAnual.helpers({
  "letraCentro":function(e)
  {
    return e.nombreCentroCosto.substring(0,2)
  },
  "nombre":function()
  {
    return this.nombreCentroCosto
  },
  "centros":function()
  {
    return CentroCostos.find().fetch();
  }
})
Template.accionesInformeAnual.events({
  "click .cambiar":function(e){
    
    var nuevoid=e.currentTarget.id;
    Meteor.call("cambiarCC",this.tipo,nuevoid,this.id,function(err,res){
      consultarPagosMes(Session.get("anoInforme"),Session.get("mesInforme"),false,false);
    
    console.log(res)
    });
    
  }
})
Template.anual.rendered=function(){
    var d=new Date();
    $("#anoSeleccion").val(d.getFullYear());
    consultarData()
}
Template.datosAnual.rendered=function(){
  Session.set("anoInforme",this.data.ano);
  Session.set("mesInforme",this.data.mes);
  Session.set("tipo",this.data.tipo);
    consultarPagosMes(this.data.ano,this.data.mes,false,false);
}
Template.anual.events({
	"click #buscarGral":function()
	{
		consultarData()
	},
	"click #chart":function(ev)
	{
		var activePoints = chart; 
		console.log(activePoints)
	}
})
