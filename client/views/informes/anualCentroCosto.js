var consultarData=function()
{
	Meteor.call("informeAnualCentroCostos",$("#anoSeleccion").val(),function(err,res){
		console.log(res);
		instanciarChart2(ripData(res))
	});
}
var arrColor=function(col)
{
	var data=[]
	for(var i=0;i<=11;i++)data.push(col)
		return data;
}
var chart=null;
var data=[];
var ripData=function(data)
{
    var labels=getLabels(data);
    var arr=[labels];
    for(var i=1;i<=12;i++)
        arr.push(getItemChart(data,i));
    return arr;
}
var getItemChart=function(items,posicion)
{
    var aux=[getMes(posicion)];
    posicion--;
    for(var i=0;i<items.length;i++)
        aux.push(items[i].ordenes[posicion]-items[i].compras[posicion]+items[i].ventas[posicion]);
    return aux;
}
var getMes=function(mes)
{
    var meses= ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return meses[(mes-1)];
}
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
var getLabels=function(items)
{
    var data=["Mes"];
    for(var i=0;i<items.length;i++)data.push(items[i].centroCosto.nombreCentroCosto);
        console.log(data)
    return data;
}

var getDatos=function(items)
{
    var data=[];
    for(var i=0;i<=11;i++)data.push(items.ventas[i]-items.compras[i]+items.ordenes[i]);
        console.log(data);
    return data;
}
var abrirVentana=function(mes,col)
{
    var data={tipo:col,mes:mes,ano:($("#anoSeleccion").val()*1)};
     Modal.show("datosMensual",function(){ return data});
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

        chart.draw(data, google.charts.Bar.convertOptions(options));
        
         google.visualization.events.addListener(chart, 'select', function() {
        var selectedItem = chart.getSelection()[0];
            if (selectedItem) {
                var mes=selectedItem.row+1;
                var col=selectedItem.column;
                console.log("col "+col);
               abrirVentana(mes,col);
            }
        });
      }
      var selectHandler=function(e) {
 var selectedItem = chart.getSelection()[0];
    if (selectedItem) {
      var value = data.getValue(selectedItem.row, selectedItem.column);
      alert('The user selected ' + value);
    }
}
Template.anualCentroCosto.events({
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
Template.anualCentroCosto.rendered=function(){
var d=new Date();
$("#anoSeleccion").val(d.getFullYear());
consultarData()
}