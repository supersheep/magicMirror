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
	function modSuccess(id, o, self) {
        // var id = id; // Transaction ID.
        var config = self.getConfig();
        var json = APP_CONFIG['dataParser'](o.responseText);
		var data = [];
        
		var names = config.names.split(',');
		var xkey = config.xkey;
		var ykeys = config.ykeys.split(',');
        
        json.forEach(function(dt,i){
        	
        	dt = dt.sort(function(a,b){
        		return a[xkey] - b[xkey];
        	});
        	        	
        	var d = dt.map(function(obj){
			
			var erroritem;
			
			// Error Warning
        	if( (obj[xkey]==null||obj[ykeys[i]]==null) && !self.isSetting){
				
        		erroritem = !obj[xkey]?"xkey":("ykeys"+i);
        		//self.setting();
        		alert(erroritem + '字段配置错误\r\n' + '对象信息：' + JSON.stringify(obj));
        	}
        	
        	
        		return [
        			obj[xkey],
        			obj[ykeys[i]]
        		];
        	});
        	data.push({data:d,label:names[i]});
        });
        
        try{
			self.fire('data',data);
		}catch(e){
			console.log('fetch error occured ' + self.clock,self.elem,self.guid);
		}
    };
	
	
	// should have event to rerender

	function MonitorPannel(xy,config){
			log('init',this);
			
		this.isSetting = false;
		this.config = config;
		this.config.xy = xy;
		this.config.size = config.size;
		
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
		show:function(){log('show',this);},
		hide:function(){log('hide',this);},
		addToDesktop:function(desktop){
			log('addToDesktop',this);
			desktop.addPannel(this);
			this.desktop = desktop;
			this.renderUI();
			this.bindUI();
			if(desktop.desktops.getCurrentDesktop() == desktop){
				this.startFetch();
			}
		},
		setting:function(){
			log('setting',this);
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
		startFetch:function(){
			
		    // Define a function to handle the response data.
		    var pannel = this;
			var setting = pannel.config.setting;
			
			if(!this.fetching){
			
				// pannel.uri = '/board/ajax/viewDataAction';
				pannel.uri = APP_CONFIG['viewUrl'];
				pannel.clock = setInterval(function(){
					console.log('clock ' + pannel.clock + ' invoked');
		   			pannel.fetch();
				},setting.interval || 5000);
				
				pannel.fetch();
				
			}
			
			this.fetching = true;
			
		},
		stopFetch:function(){
		
			if(this.fetching){
				clearInterval(this.clock);
				console.log(this.clock + 'cleared');
				this.clock = null;
			}
			this.fetching = false;
			
		},
		
		fetch:function(){
			log('fetch',this);
			var self = this,
				desktop = self.desktop,
				config = self.getConfig(),
				setting = self.config.setting,
				uri = self.uri;
			
			
			function querystr(){
				var ret = [];
				
				ret.push("viewName="+config["names"]);
				ret.push("xField="+config["xkey"]);
				ret.push("fromDate"+setting["start"]);
				ret.push("toDate"+setting["end"]);
				
				return "?" + ret.join("&");
			}
			
			if(desktop.desktops.getCurrentDesktop() == desktop){
				YUI().use('io', function (Y) {
					var query = querystr();
				    Y.on('io:success', modSuccess,Y,self);
	   				Y.io(uri + query );
					log('fetch getData',self);
				});
			}
	    },
	    renderUI:function(){
			log('renderUI',this);
			function div(cls){return Y.Node.create('<div />').addClass(cls);}
			
	    	var self = this,
	    		desktop = this.desktop,
	    		xy = this.config.xy,
	    		size = this.config.size,
	    		container = desktop.elem,
	    		wh = {width:size[0],height:size[1]},
	    		whinner = {width:size[0]-20,height:size[1]-40},
	    		lt = {left:xy[0],top:xy[1]};
	    	
			var fface,bface,
				card,close,elem,chartinner,titlebar,binner,setting;
				
			
	    	this.chart = div('chart');
			this.chartinner = div('chart-inner').setStyles(whinner);
			this.elem = div('monitor').setStyles(lt).setStyles(wh);
			this.binner = div('binner').setStyles(whinner);
			this.bface = div('bface');
			this.fface = div('fface');
			this.card = div('card');
			this.titlebar = div('titlebar').set('innerHTML',this.config.title);
			
			this.close = div('close');
			this.setbtn =  div('setting');
			
			fface = this.fface;
			bface = this.bface;
			card = this.card;
			close = this.close;
			elem = this.elem;
			chartinner = this.chartinner;
			binner = this.binner;
			chart = this.chart;
			setbtn = this.setbtn;
			titlebar = this.titlebar;
			
			
			elem.append(close);
			elem.append(card);
				card.append(bface);
					bface.append(binner);
				card.append(fface);
					fface.append(titlebar);
					fface.append(setbtn);
					fface.append(chart);
						chart.append(chartinner);
			
			elem.appendTo(container);
	    },
	    bindUI:function(){
			log('bindUI',this);
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
						h = e.info.offsetHeight - 40;
					self.chartinner.setStyles({
						'width':w ,
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
		
					self.drawChart();
					desktop.sync();
				});	
			});
			
			drag = new Y.DD.Drag({
				node: self.elem
			}).addHandle(self.titlebar).addHandle(self.bface);
			
			
			drag.plug(Y.Plugin.DDConstrained, {
		        constrain2node: Y.Node.one('.desktop-list')
		    });
			
			drag.on('drag:end', function(e) {
				self.config.xy = e.target.lastXY;
				desktop.sync();
			});	
			
			self.close.on('click',function(){
				self.destroy();
				self.desktop.sync();
			});
			self.setbtn.on('click',function(){
				self.setting();
			});
			self.on('data',function(data){
				self.drawChart(data);
			});
			
	    },
	    getConfig:function(){
	    	return widgetManager.getConfig(this.config.title);
	    },
		drawChart:function(data){	
			log('drawChart',this);
			//return false;
			var self = this,
				config = self.getConfig();
			
			data = self.data = data || self.data || [];	

			chart = APP_CONFIG['chartTypes'][self.config.setting.type];
			if(config.xkey == APP_CONFIG["timefield"]){
				chart = Y.merge(chart,{xaxis:{
					"mode":"time",
					"timeMode":"local"
				}});
			};
			
			Flotr.draw(self.chartinner.getDOMNode(), data,chart);
		},
		destroy:function(){
			log('destroy',this);
			this.desktop.removePannel(this);
		}
	}
	
	Y.augment(MonitorPannel, Y.EventTarget);
	Y.MonitorPannel = MonitorPannel;
});

