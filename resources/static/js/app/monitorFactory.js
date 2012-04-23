YUI.add('monitorFactory',function(Y){
	var monitors = {};	

	var MonitorFactory = {	
		/** 
		 *	@param type	{String}
		 *	@param axis	{Array}
		 *  @param config	{Object}
		**/
		produce:function (type,axis,desktop,config){
			var mod = monitors[type],
				realconfig;
			
			if(!mod){
				throw "module "+type+" not defined";
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
		pannel.uri = '/ajax/view.php';
		pannel.clock = setInterval(function(){
	   		pannel.fetch();
		},pannel.config.setting.interval || 5000);
		pannel.fetch();
    }
	
	
	
	// two test modules
	addMod("line",fetcher,{
		"size":[300,300],
		"chart":{},
		"setting":{
			"xkey":"",
			"ykeys":"",
			"names":"",
			"start":"",
			"end":"",
			"type":"line",
			"freq":"5"
		}
	});
	
	addMod("bar",fetcher,{
		"size":[320,350],
		"chart":{},
		"setting":{
			"xkey":"",
			"ykeys":"",
			"names":"",
			"start":"",
			"end":"",
			"step":"year"
		}
	});
	
	
	Y.MonitorFactory = MonitorFactory;
});
