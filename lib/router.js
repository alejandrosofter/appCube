applicationController = RouteController.extend({
  layoutTemplate: 'layoutApp',
	  loadingTemplate: 'loaderGral',
	  notFoundTemlplate: 'notFound',
// 	  yieldTemplates: {
// 		'applicationHeader': {to: 'header'},
// 		'projectSwitcher': {to: 'projectSwitcher'},
// 		'applicationMainNav': {to: 'mainNav'},
// 		'applicationFooter': {to: 'footer'}
// 	  },
	  waitOn: function() {
	  	if(Meteor.user())
		return [
			Meteor.subscribe('Equipos',Meteor.user()._id),
			 Meteor.subscribe('Settings'),
			
		];
	  },
	  onBeforeAction: function(pause) {
		this.render('loaderGral');
		if ( !Meteor.user() )
			{this.render('login');}
// 		if (!!this.ready() && Projects.find().count() === 0)
 	else		{this.next();}
	  },
	  action: function () {
		if (!this.ready()) {
      
		  this.render('loaderGral');
		}
		else {
		  this.render();

		}
	  }
	});
Router.route('nuevoEvento', {
    where: 'server',
    path: '/nuevoEvento/:nroSerie/:fecha/:tipoEvento/:valor',
    waitOn: function() {
		return [
			Meteor.subscribe('Equipos'),
			//Meteor.subscribe('MensajesInternos',Meteor.userId()),
		];
	  },
    action: function() {
    //   var Future = Npm.require('fibers/future');
    // var fut1 = new Future();

   	var params=this.params;
 	var salida="ok ";
 	var resp=this.response;
 	var ok=true;
 	if(ok){
			Meteor.call("eventos.nuevo",this.params.nroSerie,this.params.fecha,this.params.tipoEvento,this.params.valor,function(err,res){
		resp.end(res);
		// fut1.return(res);
	});
		   	
 	}else salida="no se puede no identificado";
  // return fut1.wait();
   	return this.response.end(this.params.nroSerie);
   }
    
  })
Router.route('getTareas', {
    where: 'server',
    path: '/getTareas/:nroSerie/',
    waitOn: function() {
		return [
			Meteor.subscribe('Equipos'),
			//Meteor.subscribe('MensajesInternos',Meteor.userId()),
		];
	  },
    action: function() {
      var Future = Npm.require('fibers/future');
    var fut1 = new Future();

   	var params=this.params;
 	var salida="ok ";
 	var resp=this.response;
 	var ok=true;
 	if(ok){
			Meteor.call("equipos.getTareas",this.params.nroSerie,function(err,res){
		resp.end(res);
		fut1.return(res);
	});
		   	
 	}else salida="no se puede no identificado";
  return fut1.wait();
   }
    
  })
Router.route('saldarTarea', {
    where: 'server',
    path: '/saldarTarea/:idTarea/:nroSerie',
    waitOn: function() {
		return [
			Meteor.subscribe('Equipos'),
			//Meteor.subscribe('MensajesInternos',Meteor.userId()),
		];
	  },
    action: function() {
      var Future = Npm.require('fibers/future');
    var fut1 = new Future();

   	var params=this.params;
 	var salida="ok ";
 	var resp=this.response;
 	var ok=true;
 	if(ok){
			Meteor.call("equipos.saldarTarea",this.params.idTarea,this.params.nroSerie,function(err,res){
		resp.end(res);
		fut1.return(res);
	});
		   	
 	}else salida="no se puede no identificado";
  return fut1.wait();
   }
    
  })
Router.route('inicio', {
		path: '/',
    template:"inicio",
		controller: applicationController,
})

Router.route('usuarios', {
		path: '/usuarios',
    template:"usuarios",
		controller: applicationController,
})
Router.route('equipos', {
		path: '/equipos',
    template:"equipos",
		controller: applicationController,
})
Router.route('/datosSistema', {
 template: 'datosSistema',
  path: '/datosSistema',
		controller: applicationController,
});
Router.route('/modificarDatosSistema/:_id', {
    template: 'modificarDatosSistema',
    controller: applicationController,
    data: function(){
			    Meteor.subscribe('Settings',this.params._id);
         var sal=Settings.findOne({_id: (this.params._id)});
        console.log(sal);
         return sal;
    }
});

