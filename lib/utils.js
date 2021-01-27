/*eslint-disable no-unreachable, no-extend-native, no-undef, semi*/
String.prototype.lpad = function(padString, length) {
    var str = this;
    while (str.length < length)
        str = padString + str;
    return str;
}
Array.prototype.buscarIndice=function(busca)
{
  var arr=this;
    for (var i = 0; i < arr.length; i++)
    if(arr[i]._id==busca)return i;
  return -1;
}
getPrecioVenta=function(doc,pos)
{
  var arr=(Cuentas.find().fetch());
      var salida="";
      for(var i=0;i<arr.length;i++){
        var precioVenta=doc.precioCompra*((doc.porcentajeGanancia/100)+1)*((arr[i].interesEnPago/100)+1);
        var redondeaDecena=Number(Settings.findOne({clave:"redondeaDecena"}).valor);
        precioVenta=Math.round(precioVenta / redondeaDecena)*redondeaDecena;
        salida+=arr[i].nombreCuenta+" <b>$ "+precioVenta+"</b> <br>";
        console.log(pos,i)
        if(pos===i)return arr[i].nombreCuenta+" <b>$ "+precioVenta.formatMoney(2)+"</b> <br>";
      }
      return salida;
}

String.prototype.hablar=function()
{
  var speech = new SpeechSynthesisUtterance(this);
  speech.voice = speechSynthesis.getVoices()[5];
  console.log("habla "+this)
    window.speechSynthesis.speak(speech);
}
function sortFunctionDate(a,b){  
    var dateA = new Date(a.fecha).getTime();
    var dateB = new Date(b.fecha).getTime();
    return dateA < dateB ? 1 : -1;  
}; 
Number.prototype.precioContado=function(porcentajeGanancia)
{
  var precioCompra=this;
  var coefGral=(Number(Settings.findOne({clave:"coeficienteProductos"}).valor)/100)+1;
  var coef=((porcentajeGanancia?porcentajeGanancia:100)/100)+1;
      var precioContado=Number((precioCompra*coef).toFixed())
      return Math.round(precioContado/10)*10;
}
Number.prototype.precioTarjeta=function(precioContado)
{
      var coefTarjeta=(Number(Settings.findOne({clave:"recargoTarjeta"}).valor)/100)+1;
      
      var precio=Number((precioContado*coefTarjeta).toFixed());
      return Math.round(precio/10)*10;
}

Array.prototype.ordenar=function()
{
  var arr=this;
  return arr.sort(sortFunctionDate)
}
Array.prototype.sumatoria=function(campo,callback)
{
  var arr=this;
  var sum=0;
  for(var i=0;i<arr.length;i++){
    if(callback)sum+=callback(arr[i]);
    else sum+=arr[i][campo];
  }
  return sum;
}
Date.prototype.addHours = function(h) {
   this.setTime(this.getTime() + (h*60*60*1000)); 
   return this;   
}
Date.prototype.addDays = function (num) {
    var value = this.valueOf();
    value += 86400000 * num;
    return new Date(value);
}
String.prototype.lpad = function(padString, length) {
    var str = this;
    while (str.length < length)
        str = padString + str;
    return str;
}
String.prototype.capitalizar = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};
String.prototype.rpad = function(padString, length) {
    var str = this;
    while (str.length < length)
        str = str+ padString ;
    return str;
}
Date.prototype.fecha=function(dias)
{
var dateOffset = (24*60*60*1000) * dias; //5 days
var myDate = this;
 myDate.setTime(myDate.getTime() - dateOffset);
 return myDate
}
Date.prototype.getFecha = function () {
    var value = this.valueOf();
    value += 86400000 * 1;
    var d= new Date(value);
  return d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear();
}
Date.prototype.getFechaCliente = function () {
    var value = this.valueOf();
    value += 86400000 * 1;
    var d= new Date(value);
  return (d.getDate()-1)+"/"+(d.getMonth()+1)+"/"+d.getFullYear();
}
Date.prototype.getFecha3 = function () {
    var value = this.valueOf();
    value += 86400000 * 1;
    var d= new Date(value);
  return (d.getDate())+"/"+(d.getMonth()+1)+"/"+d.getFullYear();
}
Date.prototype.diaSemana = function() {
  var value = this.valueOf();
    value += 86400000 * 1;
    var d= new Date(value);
  var dias=["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
  return dias[this.getUTCDay()]
};
Date.prototype.getFecha2 = function () {
    var value = this.valueOf();
    value += 86400000 * 1;
    var d= new Date(value);
  return d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear();
}
Date.prototype.getMes = function () {
    var value = this.valueOf();
    value += 86400000 * 1;
    var d= new Date(value);
  return d.getMonth()+1
}
Date.prototype.getDia= function () {
    var value = this.valueOf();
    value += 86400000 * 1;
    var d= new Date(value);
  return d.getDate()
}
Date.prototype.getAno= function () {
    var value = this.valueOf();
    value += 86400000 * 1;
    var d= new Date(value);
  return d.getFullYear()
}
Number.prototype.formatMoney = function(n, x, s, c) {
    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
        num = this.toFixed(Math.max(0, ~~n));

    return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
};
function validarLargoCBU(cbu) {
  if (cbu.length != 22) { return false }
	return true
}

var validarCodigoBanco=function(codigo) {
 if (codigo.length != 8) { return false }
 var banco = codigo.substr(0,3)
 var digitoVerificador1 = codigo[3]
 var sucursal = codigo.substr(4,3)
 var digitoVerificador2 = codigo[7]

 var suma = banco[0] * 7 + banco[1] * 1 + banco[2] * 3 + digitoVerificador1 * 9 + sucursal[0] * 7 + sucursal[1] * 1 + sucursal[2] * 3

 var diferencia = 10 - (suma % 10)

 return diferencia == digitoVerificador2
}
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
mesNumeros=function(mes)
{
  if(mes=="ENERO")return 1;
  if(mes=="FEBRERO")return 2;
  if(mes=="MARZO")return 3;
  if(mes== "ABRIL")return 4;
  if(mes=="MAYO")return 5;
  if(mes=="JUNIO")return 6;
  if(mes== "JULIO")return 7;
  if(mes=="AGOSTO")return 8;
  if(mes=="SEPTEMBRE")return 9;
  if(mes=="OCTUBRE")return 10;
  if(mes=="NOVIEMBRE")return 11;
  if(mes=="DICIEMBRE")return 12;
  return null;
}
getMeses=function()
{
  return ["ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO","JULIO","AGOSTO","SEPTEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE"];
}
ripFechaArchivo=function(fechaDate)
{
    var st=fechaDate.toLocaleDateString();
    var arr=st.split("/");
    
    return arr[0].lpad("0",2)+arr[1].lpad("0",2)+arr[2].lpad("0",2)
}
getImporteTotalSocios=function(arr)
{
    var sum=0;
    for(var i=0;i<arr.length;i++)sum+=arr[i].importe*1;
    return sum;
}
ripImporteArchivo=function(importe)
{
    importe=importe+"";
    var arr=importe.split(".");
    if(arr.length>1)return arr[0].lpad("0",8)+arr[1].lpad("0",2);
    return arr[0].lpad("0",8)+"00";
}
var validarCuenta=function(cuenta) {
 if (cuenta.length != 14) { return false }
 var digitoVerificador = cuenta[13]
 var suma = cuenta[0] * 3 + cuenta[1] * 9 + cuenta[2] * 7 + cuenta[3] * 1 + cuenta[4] * 3 + cuenta[5] * 9 + cuenta[6] * 7 + cuenta[7] * 1 + cuenta[8] * 3 + cuenta[9] * 9 + cuenta[10] * 7 + cuenta[11] * 1 + cuenta[12] * 3
 var diferencia = 10 - (suma % 10)
 return diferencia == digitoVerificador
}

validarCBU=function(cbu) {
 return validarLargoCBU(cbu) && validarCodigoBanco(cbu.substr(0,8)) && validarCuenta(cbu.substr(8,14))
}