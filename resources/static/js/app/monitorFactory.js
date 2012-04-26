YUI.add('monitorFactory',function(Y){
	var monitors = {};	

	var MonitorFactory = {	
		/** 
		 *	@param type	{String}
		 *	@param axis	{Array}
		 *  @param config	{Object}
		**/
		produce:function (name,axis,desktop,config){
		
			var mod = monitors[name],
				realconfig;
			
			if(!mod){
				throw "module "+name+" not defined";
			}
			
			realconfig = Y.clone(config);
			
			realconfig = Y.merge(mod.config,realconfig);
			realconfig.setting = Y.mix(realconfig.setting,mod.config.setting||{});
	
			new Y.MonitorPannel(mod.fetcher,
				axis,
				realconfig
			).addTo(desktop);	
		},
		add:function(type,fetcher,config){
			monitors[type] = {
				fetcher:fetcher,
				config:Y.merge({type:type},config)
			};
		}
	}
	
	var addMod = MonitorFactory.add;
	
	// functions for addMod
	
	function fetcher(){
	    // Define a function to handle the response data.
	    var pannel = this;
	    var chart = pannel.config.chart;
		var setting = pannel.config.setting;
		
		// pannel.uri = '/board/ajax/viewDataAction';
		pannel.uri = APP_CONFIG['viewUrl'];
		pannel.clock = setInterval(function(){
	   		pannel.fetch();
		},pannel.config.setting.interval || 5000);
		pannel.fetch();
    }
	
	
	widgetsData.forEach(function(w){
			
		addMod(w.title,fetcher,{
			"size":w.size,
			"setting":w.setting
		});
	
	});
	
	
	Y.MonitorFactory = MonitorFactory;
});
