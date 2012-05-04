YUI.add('monitorFactory',function(Y){
	
	function MonitorFactory(){
		log('init',this);
		var self = this;
		
		function add(w){
			self.add(w.config.title,{
				"size":[300,300],
				"title":w.config.title,
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
		
		produce:function (name,axis,desktop,config){
			log('produce',this);
			var mod = this.monitors[name];
				
			if(!mod){
				throw "module "+name+" not defined";
			}
			
			new Y.MonitorPannel(
				axis,
				Y.merge(config,mod)
			).addToDesktop(desktop);	
		},
		add:function(title,mod){
			log('add',this);
			this.monitors[title] = mod;
		}
	}
	
	// functions for addMod
	
	
	
	
	Y.MonitorFactory = MonitorFactory;
});
