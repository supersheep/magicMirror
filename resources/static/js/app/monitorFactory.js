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
			
			new Y.MonitorPannel(
				axis,
				Y.merge(config,mod)
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
