//  import Tabular from 'meteor/aldeed:tabular';
// import moment from 'moment';



// function getColumna(datos)
// {
//   return {data: datos.nombreCuenta, width: '120px', search: { isNumber: true, exact: false, },title: "$ "+datos.nombreCuenta,render: function(val, type, doc){
//       var precioBase=doc.precioCompra.precioContado(doc.porcentajeGanancia);
//       var interes=(datos.interesEnPago/100)+1;
//       if(interes>0)precioBase=precioBase*interes;
//       return new Spacebars.SafeString("<span style='color:blue;font-size:12px'>"+precioBase.formatMoney(2)+"</span>");
            
//      }}
// }
// function setColumnasPrecios()
// {
//   Meteor.call("cuentas.all",function(err,arr){
//     var salida=[];
//   for(var i=0;i<arr.length;i++) salida.push(getColumna(arr[i]))
//   colocar(arr)

//   })
  
  
// }
// function getColumnas(arr)
// {
//   var arr=[
//      {data: "disponibilidad", width: '80px', search: { isNumber: true, exact: false, },title: "Disp."},
//     {data: "nombreProducto",search: { isNumber: false, exact: false, }, title: "Producto",render: function (val, type, doc) {
    
//          return new Spacebars.SafeString("<span  class='nombreProducto' style='cursor:pointer;'> "+val+"</span>");
         
//     }},
//      {data: "codigoBarras",width: '150px', search: { isNumber: false, exact: false, },title: "COD BARRAS"},
//      {data: "nombreProducto",search: { isNumber: false, exact: false, }, title: "PRECIO VENTA",render: function (val, type, doc) {
//       // var arr=(Cuentas.find().fetch());
//       // var salida="";
//       // for(var i=0;i<arr.length;i++){
//       //   var precioVenta=doc.precioCompra*((doc.porcentajeGanancia/100)+1)*((arr[i].interesEnPago/100)+1);
//       //   var redondeaDecena=Number(Settings.findOne({clave:"redondeaDecena"}).valor);
//       //   precioVenta=Math.round(precioVenta / redondeaDecena)*redondeaDecena;
//       //   salida+=arr[i].nombreCuenta+" <b>$ "+precioVenta+"</b> <br>";
//       // }
//       var salida=getPrecioVenta(doc);
//       return new Spacebars.SafeString("<span  class='' style=''> "+salida+"</span>");
         
         
//     }},
  
//     ];
//      arr.concat(arr);
//      arr.push( {  title: '',  width: '130px', tmpl: Meteor.isClient && Template.accionesProductos})
// return arr;
// }
// function colocar(arr)
// {
//   console.log(arr)
//   if(arr)
//      new Tabular.Table({
//   name: "Productos",
//    language: {
//      processing: "<img src='/images/loading.gif'>"
//   },
//    processing: true,
//    stateSave: true,
//   collection: Productos,
// //    createdRow( row, data, dataIndex ) {
// //     if(data.estado=="BAJA"){
// //       var fila=$(row);
// //       fila.attr("class","deshabilitado");
// //     }
// //   },
//    extraFields: ['grupos',"precioCompra","porcentajeGanancia","imagenes"],
   
//   // autoWidth: false, // puse esto por que cuando eliminaba un socio y volvia a socios queda la tabla por la mitad
// //classname:"compact",
//   columns: getColumnas(arr)
     
   
  
// });
// }
// colocar([]);