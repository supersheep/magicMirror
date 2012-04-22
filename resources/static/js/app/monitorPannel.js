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
	Y.MonitorPannel = MonitorPannel;
});

