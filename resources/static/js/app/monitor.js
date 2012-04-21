/**
 *	@module Monitor
 *	@author	Spud Hsu
 *
 *	
 *	/// 使用一个monitor时的生命周期，调用链：///
 *
 *	- Y.Monitor.produce(type,axis,container,config); 
 *	- new MonitorPannel(container,fetcher,axis,config);
 *	- fetcher.call(self);
 *	- on('data',render);
**/

YUI.add('monitor',function(Y){
	
	var monitors = {};
	
	// should have event to rerender
	var MonitorPannel = function(desktop,fetcher,axis,config){
		var self = this,
			drag,resize,size,
			container = desktop.elem;
		
		this.isSetting = false;
		this.config = config;
		this.config.xy = axis;
		
		size = config.size;
		
		this.chart = Y.Node.create('<div />').addClass('chart');
		
		this.inner = Y.Node.create('<div />').setStyles({
			"width":size[0],
			"height":size[1]
		}).addClass('chart-inner');
		
		
		this.elem = Y.Node.create('<div />').setStyles({
			"left":axis[0],
			"top":axis[1]
		}).addClass("monitor");
		
		this.binner = Y.Node.create('<div />').setStyles({
			"width":size[0],
			"height":size[1]
		}).addClass('binner');
		
		this.card = Y.Node.create('<div />').addClass('card');
		
		
		var setting = Y.Node.create('<div />').addClass('setting'),
			fface = Y.Node.create('<div />').addClass('fface'),
			close = Y.Node.create('<div />').addClass('close'),
			bface = Y.Node.create('<div />').addClass('bface'),
			card = this.card,
			elem = this.elem,
			inner = this.inner,
			binner = this.binner,
			chart = this.chart;
		
		
		
		resize = new Y.Resize({
	        //Selector of the node to resize
	        node: this.elem
	    });   
	
		resize.on('resize:resize',function(e){
			var w = e.info.offsetWidth - 20;	
				h = e.info.offsetHeight - 30;
			self.inner.setStyles({
				'width':w,
				'height':h
			});
			self.binner.setStyles({
				'width':w,
				'height':h
			});
		});

		resize.on('resize:end',function(e){
			var w = e.info.offsetWidth,
				h = e.info.offsetHeight;
			self.config.size = [w,h];

			self.render();
			desktop.sync();
			console.log("resize end");
		});	
		
		
		
		drag = new Y.DD.Drag({
			node: this.elem
		});		
		
		drag.on('drag:end', function(e) {
			self.config.xy = e.target.lastXY;
			self.update();
			desktop.sync();
		});	
		
		close.on('click',Y.bind(this.destroy,this));
		setting.on('click',Y.bind(this.setting,this));
		
		close.appendTo(elem);
		binner.appendTo(bface);
		bface.appendTo(card);
		fface.appendTo(card);
		
		setting.appendTo(fface);
		chart.appendTo(fface);
		inner.appendTo(chart);
		
		card.appendTo(elem);
		elem.appendTo(container);
		
		
		fetcher = fetcher;		
		
		this.on('data',function(data){
			self.render(data);
		});
		this.guid = Y.guid();
		this.desktop = desktop;
		fetcher.call(self);
		desktop.add(self);
	};
	
	MonitorPannel.prototype = {
		constructor:MonitorPannel,
		show:function(){},
		hide:function(){},
		update:function(){
			var elem = this.elem,
				data = this.config;
		},
		setting:function(){
			var self = this,
				setting = self.config.setting,	
				card = self.card,
				binner = self.binner,
				settingPannel;

			card.addClass('set');
			
			self.isSetting = true;
			settingPannel = new Y.Setting(setting);
			
			settingPannel.renderUI(binner);
			settingPannel.on('complete',function(setting){
				self.config.setting = setting;
				self.desktop.sync();
				card.removeClass('set');
				self.isSetting = false;
			});
		},
		fetch:function(Y){
			var self = this,
				uri = self.uri;
			if( self.desktop.desktops.current == self.desktop.index){
	   			Y.io(uri + '?viewName=' + self.config.setting.names);
	   		}
	    },
		render:function(data){	
			//return false;
			var self = this;
			var chart = self.config.chart;
			data = self.data = data || self.data || [];			
			Flotr.draw(self.inner.getDOMNode(), data,chart);
		},
		destroy:function(){
			this.desktop.remove(this);
		}
	}
	
	Y.augment(MonitorPannel, Y.EventTarget);
	
	
	

	var Monitor = {	
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
	
			new MonitorPannel(
				desktop,
				mod.fetcher,
				axis,
				realconfig
			);	
		},
		add:function(type,fetcher,config){
			monitors[type] = {
				fetcher:fetcher,
				config:Y.merge({type:type},config)
			};
		}
	}
	
	var addMod = Monitor.add;
	
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
			"noTicks":5		
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
	
	
	Y.Monitor = Monitor;
});

