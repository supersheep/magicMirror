YUI.add('monitorFactory',function(Y){
	
	function MonitorFactory(){
		log('init',this);
		var self = this;
		
		function add(w){
			self.add(w.id,{
				"size":[300,300],
				"id":w.id,
				"setting":Y.merge({
					"type":"line",
					"timeBy":"r",
					"start":"",
					"end":""
				},w.setting)
			});
		}
		
		self.monitors = {};
		widgetManager.on('addone',add);
		widgetsData.forEach(add);
	}
	
	MonitorFactory.prototype = {	
		constructor:MonitorFactory,
		/** 
		 *	@param type	{String}
		 *	@param axis	{Array}
		 *  @param config	{Object}
		**/
		
		produce:function (id,axis,desktop,config){
			log('produce',this);
			var mod = this.monitors[id];
				
			if(!mod){
				throw "module " + id + " not defined";
			}
			config = config || {};
			// simple code is more important, give up to insure the order of controls
			config.setting = Y.mix(config.setting || {},mod.setting);
			
			new Y.MonitorPannel(
				axis,
				Y.merge(mod,config)
			).addToDesktop(desktop);	
		},
		add:function(id,mod){
			log('add',this);
			this.monitors[id] = mod;
		}
	}
	
	// functions for addMod
	
	
	
	
	Y.MonitorFactory = MonitorFactory;
});
