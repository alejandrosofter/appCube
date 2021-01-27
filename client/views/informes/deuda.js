function buscar(tipo){
	Meteor.call("buscarDeuda",tipo,function(err,res){
    console.log(res)
		Session.set(tipo+"_deuda",res);
	})
}
Template.deuda.rendered=function(){
	buscar()
}
Template.deuda.helpers({
	"settingsCompras":function(){
		
    }
})