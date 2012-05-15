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
        var alias = json.alias.split(',');
        
        // multi view data
        json.data.forEach(function(dt,i){
        	var ykey = ykeys[i].split('|');
        	// one view data
        	
        	// sort them
        	dt = dt.sort(function(a,b){
        		return a[xkey] - b[xkey];
        	});
        	
        	// [{a,b,c},{a,b,c}]…
        	// translate object to array
        	var d = dt.map(function(obj){
				
				var retarr = [];
				var erroritem,ykeys;
				
	        	try{
        		
        			retarr.push(obj[xkey]);
        		
        			ykey.forEach(function(key){
        				retarr.push(obj[key]);
        			});
        			
        		}catch(e){
        		
        			parseError();
        			
        		}
        		
        		return retarr;
        	});
        	
        	data.push({data:d,label:alias[i]});
        });
        
        
		self.fire('data',data);
		
    };
	
	function parseError(obj,xkey,ykey){
		var pair = '';
		var key = [];
		var expect = [];
		
		if(!obj[xkey]){
			key.push('xkey');
			expect.push(xkey);
		}
		ykey.forEach(function(k,i){
			if(!obj[k]){
				key.push('ykey'+i);
				expect.push(k);
			}
		});
		
		key.forEach(function(k,i){
			pair += (k + ':' + expect[i]);
		});
		console.error('字段配置错误：' + pair + '你的对象：' + JSON.stringify(obj));
	}
	
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
			settingPannel.on('cancel',function(){
				card.removeClass('set');
				self.isSetting = false;
			})
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
				},setting.interval || APP_CONFIG['fetchItv'] * 1000);
				
				pannel.fetch();
				this.fetching = true;
			}
			
			
		},
		stopFetch:function(){
		
			if(this.fetching){
				clearInterval(this.clock);
				console.log(this.clock + 'cleared');
				this.clock = null;
				this.fetching = false;
			}
			
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
	    		config = self.getConfig(),
	    		wh = {width:size[0],height:size[1]},
	    		whinner = {width:size[0]-20,height:size[1]-50},
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
			this.titlebar = div('titlebar').set('innerHTML',config.title);
			
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
						h = e.info.offsetHeight - 50;
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
	    	return widgetManager.getConfig(this.config.id);
	    },
		drawChart:function(data){	
			log('drawChart',this);
			//return false;
			var self = this,
				chart = APP_CONFIG['chartTypes'][type],
				subchart = APP_CONFIG['chartTypes']["bar"],
				type = self.config.setting.type,
				config = self.getConfig();
			
			data = self.data = data || self.data || [];	
			
			// is time
			if(config.xkey == APP_CONFIG["timefield"] && type!=="pie"){
				chart = Y.merge(chart,{xaxis:{
					"mode":"time",
					"timeMode":"local"
				}});
				
				subchart = Y.merge(subchart,{xaxis:{
					"mode":"time",
					"timeMode":"local"
				}});
			};
			
			// pie
			if(type === "pie"){
				data = data.map(function(d){
					var all_data = d.data;
					for(var i=0,sum=0,l=all_data.length;i<l;i++){
						sum += all_data[i][1];
					}
					return {data:[[0,sum/l]],label:d.label};
				});
				
					
				chart.HtmlText = false;
			}
			
			
			data.forEach(function(d){
				var expected = chart.ycount,
					given = d.data[0].length -1;
					
				if(given < expected){
					console.error(type + " y字段不足，需要" + expected + '，给了' + given,d);
				}
			});
			
			
			if(true){
				(function(){
					var wrap = self.chartinner;
					var main = Y.Node.create('<div />').setStyle('height',"80%");
					var sub = Y.Node.create('<div />').setStyle('height',"20%");
					wrap.empty();
					main.appendTo(wrap);
					sub.appendTo(wrap);
					
					Flotr.draw(main.getDOMNode(), data,Y.merge(chart,{
    					xaxis : { 
    						showLabels : false,
    						margin:false
    					},
    					grid:{
						    outline : 'new',
				        	verticalLines : false,
				        	horizontalLines:false
					    }
    				}));
    				
    				
    				
					Flotr.draw(sub.getDOMNode(), data.map(function(d){
						return d.data;
					}),Y.merge(subchart,{
						yaxis : { 
							showLabels: false
						},
				        grid : {
				        	outline:'ews',
				        	verticalLines : false,
				        	horizontalLines:false
				        }
					}));
				})()
			}else{
				Flotr.draw(self.chartinner.getDOMNode(), data,chart);
			}
			
		},
		destroy:function(){
			log('destroy',this);
			this.desktop.removePannel(this);
		}
	}
	
	Y.augment(MonitorPannel, Y.EventTarget);
	Y.MonitorPannel = MonitorPannel;
});

