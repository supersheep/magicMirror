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
	
	function modSuccess(id, o, self) {
        // var id = id; // Transaction ID.
        var setting = self.config.setting;
        // var json = JSON.parse(JSON.parse(o.responseText).data); // Response data.
        var json = JSON.parse(o.responseText).data;
		var data = [];
        
		var names = setting.names.split(',');
		var xkey = setting.xkey;
		var ykeys = setting.ykeys.split(',');
        
		
        json.forEach(function(dt,i){
        	var d = dt.map(function(obj){
			
			var erroritem;
        	if( (obj[xkey]==null||obj[ykeys[i]]==null) && !self.isSetting){

        		erroritem = obj[xkey]?"xkey":("ykeys"+i);
        		console.log(self.isSetting);
        		self.setting();
        		alert(erroritem + '字段配置错误');
        	}
        		return [
        			new Date(obj[xkey]),
        			obj[ykeys[i]]
        		];
        	})
        	data.push({data:d,label:names[i]});
        });
		self.fire('data',data);
    };
	
	function fetcher(){
	    // Define a function to handle the response data.
	    var self = this;
	    var chart = self.config.chart;
		var setting = self.config.setting;
		
		// self.uri = '/board/ajax/viewDataAction';
		self.uri = '/ajax/view.php';
		YUI().use('io', function (Y) {
			
		    Y.on('io:success', modSuccess,Y,self);
	    	self.fetch(Y);
			self.clock = setInterval(function(){
		   		self.fetch(Y);
			},15000);
		});
    }
	
	
	
	// two test modules
	addMod("line",fetcher,{
		"size":[300,300],
		"chart":{
			"xaxis":{
				"mode":"time"
			},
			"noTicks":5,
		},
		"setting":{
			"xkey":"time",
			"ykeys":"cn,cn",
			"names":"a,b",
			"start":"",
			"freq":"5",
			"step":"year"
		}
	});
	
	addMod("bar",fetcher,{
		"size":[320,350],
		"chart":{
			"xaxis":{
				"mode":"time"
			},
			"bars" : {
		        show : true,
		        shadowSize : 0,
		        barWidth : 0.5
		    }
		},
		"setting":{
			"xkey":"",
			"ykeys":"",
			"names":"",
			"start":"",
			"step":"year"
		}
	});
	
	
	Y.MonitorFactory = MonitorFactory;
});
