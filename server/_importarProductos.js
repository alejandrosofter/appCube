_importarProductos=function(quita){
		const spawn = require('threads').spawn;

const thread = spawn(function(input, done) {
	var mongo = require('mongodb-bluebird');
	
	var arr=[];
		var resultados="";
	//	if(input.quita){
			console.log("quita prudctos");
			var puertoBase="27017";
  var nombreBase="appCalesita";
// 		var puertoBase="3001";
//    var nombreBase="meteor";
			mongo.connect('mongodb://localhost:'+puertoBase+'/'+nombreBase).then(function(db) { db.collection("productos").drop();});
		//}
		console.log("INGRESANDO prudctos");
			var path = input.path+"/tmp.csv";
		var pathSalida = input.path+"/tmpSalida.txt";
		var contador=0;
		var contadorError=0;
		var fs = require('fs');
		
		fs.writeFile(pathSalida,"",function(err){if(err)throw err;});//VACIO EL LOG
    var readline = require('readline');
		var rd = readline.createInterface({
    input: fs.createReadStream(path),
});
	var i=0;
		rd.on('line',(function (line){
			
			contador++;

   var res = line.split(",");
		
      	var nombre=res[1];
			if(res[4]==='')res[4]=0;
      	var disp=Number(res[4]);
      	var precio=0;
			if(res[5]!=='')precio=Number(res[5]);
      	var codigo=res[2].toString();
			
			if(codigo===''){
				var d = new Date();
				codigo=d.getTime()+i;
				i++
			}
			var grupo=[];
			if(res[6]!=='')grupo.push(res[6]);
			var id='_' + Math.random().toString(36).substr(2, 9);
				var data={_id:id,disponibilidad:disp,nombreProducto:nombre,precioVenta:precio,codigoBarras:codigo,grupos:grupo};
				arr.push(data);
			}) );
         var aux="";
			rd.on('close', function(){
				mongo.connect("mongodb://localhost:"+puertoBase+"/"+nombreBase).then(function(db) {
    //if(db)db.createIndex( { "codigoBarras": 1 }, { unique: true } );
    var tabla = db.collection('productos');
					for(var i=0;i<arr.length;i++){
					 tabla.insert(arr[i]).then(function(re) {
       
    }).catch(function(err) {
        console.error("ERROR DE CARGA:"+err.errmsg+" socio"+err);
    });
				}
    
});
				
			});
 
});
		 thread
  .send({quita:quita,path:process.cwd()})
  // The handlers come here: (none of them is mandatory) 
  .on('message', function(response) {
    console.log(response.aux);
    thread.kill();
  })

};