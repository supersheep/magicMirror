YUI.add('monitorFactory',function(Y){
	var monitors = {};	
	
	function MonitorFactory(){
		
		log('init',this);
	}
	
	MonitorFactory.prototype = {	
		constructor:MonitorFactory,
		/** 
		 *	@param type	{String}
		 *	@param axis	{Array}
		 *  @param config	{Object}
		**/
		
		produce:function (name,axis,desktop,config){
			log('produce',this);
			var mod = monitors[name],
				realconfig;
				
			if(!mod){
				throw "module "+name+" not defined";
			}
			
			realconfig = Y.clone(config);
			
			realconfig = Y.merge(mod.config,realconfig);
			realconfig.setting = Y.mix(realconfig.setting,mod.config.setting||{});
	
			new Y.MonitorPannel(
				axis,
				realconfig
			).addToDesktop(desktop);	
		},
		add:function(title,config){
			log('add',this);
			monitors[title] = {
				config:Y.merge({title:title},config)
			};
		}
	}
	
	var factory = new MonitorFactory();
	
	// functions for addMod
	
	widgetsData.forEach(function(w){
		factory.add(w.title,{
			"size":w.size,
			"setting":w.setting
		});
	
	});
	
	
	Y.MonitorFactory = factory;
});
