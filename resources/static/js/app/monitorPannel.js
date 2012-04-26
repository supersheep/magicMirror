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

YUI.add('monitorPannel',function(Y){
	console.log('monitorPannel',Y._yuid);
	
	
	
	function modSuccess(id, o, self) {
        // var id = id; // Transaction ID.
        var setting = self.config.setting;
        var json = APP_CONFIG['dataParser'](o.responseText);
		var data = [];
        
		var names = setting.names.split(',');
		var xkey = setting.xkey;
		var ykeys = setting.ykeys.split(',');
        
        json.forEach(function(dt,i){
        	
        	dt = dt.sort(function(a,b){
        		return a[xkey] - b[xkey];
        	});
        	        	
        	var d = dt.map(function(obj){
			
			var erroritem;
			
			// Error Warning
        	if( (obj[xkey]==null||obj[ykeys[i]]==null) && !self.isSetting){

        		erroritem = !obj[xkey]?"xkey":("ykeys"+i);
        		console.log(self.isSetting);
        		self.setting();
        		alert(erroritem + '字段配置错误');
        	}
        	
        	
        		return [
        			obj[xkey],
        			obj[ykeys[i]]
        		];
        	});
        	data.push({data:d,label:names[i]});
        });
        
        
        	console.log(JSON.stringify(data));
		self.fire('data',data);
    };
	
	
	// should have event to rerender

	var MonitorPannel = function(fetcher,xy,config){
			
		this.isSetting = false;
		this.config = config;
		this.config.xy = xy;
		this.config.size = config.size;
		this.fetcher = fetcher;
		
		/* elem
			-close
			-card
				-fface
					-setting
					-chart
						-inner
				-bface
					-binner
		*/
		
		
		
	};
	
	MonitorPannel.prototype = {
		constructor:MonitorPannel,
		show:function(){},
		hide:function(){},
		addTo:function(desktop){
			desktop.add(this);
			this.desktop = desktop;
			this.renderUI();
			this.bindUI();
			this.fetcher.call(this);
		},
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
				self.fetch();
				card.removeClass('set');
				self.isSetting = false;
			});
		},
		fetch:function(){
			var self = this,
				uri = self.uri;
			
			var params = {
				"viewName":"names",
				"fromDate":"start",
				"toDate":"end",
				"xField":"xkey"
			}
			
			function querystr(params){
				var ret = [];
				for(var key in params){
					ret.push(key + "=" + self.config.setting[params[key]]||'');
				}
				return "?" + ret.join("&");
			}
			
			if( self.desktop.desktops.current == self.desktop.index){
				YUI().use('io', function (Y) {
					var query = querystr(params);
				    Y.on('io:success', modSuccess,Y,self);
	   				Y.io(uri + query );
				});
	   		}
	    },
	    renderUI:function(){
			function div(cls){return Y.Node.create('<div />').addClass(cls);}
			
			
			
			
	    	var self = this,
	    		desktop = this.desktop,
	    		xy = this.config.xy,
	    		size = this.config.size,
	    		container = desktop.elem,
	    		wh = {width:size[0],height:size[1]},
	    		whinner = {width:size[0]-20,height:size[1]-30},
	    		lt = {left:xy[0],top:xy[1]};
	    	
			var fface = div('fface'),
				bface = div('bface'),
				card,close,elem,chartinner,binner,setting;
				
			
	    	this.chart = div('chart');
			this.chartinner = div('chart-inner').setStyles(whinner);
			this.elem = div('monitor').setStyles(lt).setStyles(wh);
			this.binner = div('binner').setStyles(whinner);
			
			this.card = div('card');
			
			this.close = div('close');
			this.setbtn =  div('setting');
			
			fface = div('fface');
			bface = div('bface');
			card = this.card;
			close = this.close;
			elem = this.elem;
			chartinner = this.chartinner;
			binner = this.binner;
			chart = this.chart;
			setbtn = this.setbtn;
			
			
			close.appendTo(elem);
			
			card.appendTo(elem);
			bface.appendTo(card);
			fface.appendTo(card);
			
			setbtn.appendTo(fface);
			chart.appendTo(fface);
			
			binner.appendTo(bface);
			chartinner.appendTo(chart);
			
			
			elem.appendTo(container);
	    },
	    bindUI:function(){
	    	
	    	var self = this,
	    		desktop = this.desktop,
	    		close = this.close,
	    		setbtn = this.setbtn,
	    		resize,drag;
	    		
	    	YUI().use('resize',function(Y){
			
				var resize =new Y.Resize({
			        //Selector of the node to resize
			        node: self.elem
			    });   
	    	
				resize.on('resize:resize',function(e){
					var w = e.info.offsetWidth - 20;	
						h = e.info.offsetHeight - 30;
					self.chartinner.setStyles({
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
		
					self.syncUI();
					desktop.sync();
					console.log("resize end");
				});	
			});
			
			drag = new Y.DD.Drag({
				node: this.elem
			});		
			
			drag.on('drag:end', function(e) {
				self.config.xy = e.target.lastXY;
				self.update();
				desktop.sync();
			});	
			
			this.close.on('click',Y.bind(this.destroy,this));
			this.setbtn.on('click',Y.bind(this.setting,this));
			this.on('data',function(data){
				self.syncUI(data);
			});
			
	    },
		syncUI:function(data){	
			//return false;
			var self = this;
			var chart = self.config.chart;
			data = self.data = data || self.data || [];	

			chart = APP_CONFIG['chartTypes'][self.config.setting.type];
			if(self.config.setting.xkey == APP_CONFIG["timefield"]){
				chart = Y.merge(chart,{xaxis:{
					"mode":"time",
					"timeMode":"local"
				}});
			};
			
			console.log(chart);
			Flotr.draw(self.chartinner.getDOMNode(), data,chart);
		},
		destroy:function(){
			this.desktop.remove(this);
		}
	}
	
	Y.augment(MonitorPannel, Y.EventTarget);
	Y.MonitorPannel = MonitorPannel;
});

