YUI.add('desktopManager',function(Y){
	var Dom = Y.Node;
	
	function DesktopManager(container,initdata){
		log('init',this);
		var self = this,
			leftbtn = self.leftbtn = Dom.create('<div/>').addClass('desktop-btn-left desktop-btns'),
			rightbtn = self.rightbtn = Dom.create('<div/>').addClass('desktop-btn-right desktop-btns'),
			addbtn = self.addbtn = Dom.create('<div/>').addClass('desktop-btn-add desktop-btns'),
			removebtn = self.removebtn = Dom.create('<div/>').addClass('desktop-btn-remove desktop-btns'),
			spots = self.spots = Dom.create('<ul />').addClass('desktop-spots'),
			list = self.list = Dom.create('<div/>').addClass('desktop-list');
		
		self.max = 10; // 最多十屏幕
		self.desktops = [];
		self.container = container;		
		
	
		Y.on('windowresize',Y.bind(self.renderUI,self));
		leftbtn.on('click',function(){
			self.left();
			self.sync();
		});
		rightbtn.on('click',function(){
			self.right();
			self.sync();
		});
		addbtn.on('click',function(){
			self.addDesktopAndSlideTo();
			self.sync();
		});
		removebtn.on('click',function(){
			self.remove();
			self.sync();
		});
		spots.on('click',function(e){
			self.slideTo(e.target.getAttribute('data-index'));
			self.sync();
		});
		
		
		container
		.append(list)
		.append(addbtn)
		.append(removebtn)
		.append(leftbtn)
		.append(rightbtn)
		.append(spots);
		
		if(!initdata){
			self.add();
			self.slideTo(0);
		}else{
			self.current = initdata.current;
			initdata.desktops.forEach(function(d){
				var desk = self.addDesktop();
				d.forEach(function(cfg){
					Y.MonitorFactory.produce(cfg.type,cfg.xy,desk,{
						setting:cfg.setting,
						size:cfg.size,
						xy:cfg.xy
					});
				});
			});
			
			self.slideTo(initdata.current);
		}
	}
		
	DesktopManager.prototype = {
		constructor:DesktopManager,
		renderUI:function(){
			log('renderUI',this);
			var self = this,
			
				list = self.list,
				spots = self.spots,
				desktops = self.desktops,
				
				count = desktops.length,
				current = self.current,
				
				top,
				margin = 10,
				BTN_HEIGHT = BTN_WIDTH = 34,
				
				leftbtn = self.leftbtn,
				addbtn = self.addbtn,
				removebtn = self.removebtn,
				rightbtn = self.rightbtn;
				
			winWidth = list.get('winWidth'),
			winHeight = list.get('winHeight');
				
				
			top = (winHeight - BTN_HEIGHT) / 2;
			list.setStyle('left',-((current) * winWidth) + 'px');			
			list.setStyle('width',list.get('winWidth') * count);
			
			addbtn.setStyles({
				"right":margin,
				"top":margin
			});
			
			removebtn.setStyles({			
				"right":margin + BTN_HEIGHT + margin * 2,
				"top":margin
			});
			
			leftbtn.setStyles({
				"left": margin ,
				"top": top
			});
			
			rightbtn.setStyles({			
				"right":margin ,
				"top":top
			});
			
			self.showControls();
			
			spots.empty();
			desktops.forEach(function(desktop,i){
				var spot = Dom.create('<li />')
				
				spot.addClass('desktop-spot');
				spot.setAttribute('data-index',i);
				
				if(i==current){
					spot.addClass('current');		
				}
				
				if(i == count-1){
					spot.setStyle('margin-right',0);
				}
				
				spots.append(spot);
				desktop.resize();
			});
			spots.setStyles({
				"top":margin,
				"left":(winWidth - spots.get('clientWidth')) /2
			});
		},
		hideControls:function(){
			log('hideControls',this);
			var self = this;
			"addbtn removebtn leftbtn rightbtn".split(' ').forEach(function(e){			
				self[e].setStyle('opacity',0);
			});
		},
		showControls:function(){
			log('showControls',this);
			var self = this,
			
				leftbtn = self.leftbtn,
				addbtn = self.addbtn,
				removebtn = self.removebtn,
				rightbtn = self.rightbtn,
				
				count = self.desktops.length,
				last = count - 1,
				current = self.current,
				max = self.max,
				OPACITY = "opacity";
				
			function opacityCondition(condition){
				return condition?0:0.75;
			}
			
			addbtn.setStyle(OPACITY,opacityCondition(count == max));			
			removebtn.setStyle(OPACITY,opacityCondition(count == 1));			
			leftbtn.setStyle(OPACITY,opacityCondition(current <= 0));			
			rightbtn.setStyle(OPACITY,opacityCondition(current >= last));
		},
		right:function(e){
			log('right',this);
			if(this.current < this.desktops.length-1){
				this.slideTo(this.current+1);
			}
		},
		left:function(){
			log('left',this);
			if(this.current > 0){
				this.slideTo(this.current-1);
			}
		},
		slideTo:function(n){
			log('slideTo',this);
			if(n>=0 && n<=this.desktops.length -1){
				this.current = +n;
				this.renderUI();
				this.getCurrentDesktop().pannels.forEach(function(pannel){
					pannel.fetcher.call(pannel);
				});
			}
		},
		addDesktop:function(){
			log('addDesktop',this);
			var self = this,
				max = self.max,
				desktops = self.desktops,
				list = self.list,
				spots = self.spots,
				desktop;

			if(desktops.length < max){
				desktop = new Y.Desktop(desktops.length);
				desktop.desktops = this;
				desktop.on("sync",Y.bind(self.sync,self));
				desktops.push(desktop);
				list.append(desktop.elem);
				//self.current = desktops.length - 1;
				//self.render();
				return desktop;
			}
		},
		addDesktopAndSlideTo:function(){
			log('addDesktopAndSlideTo',this);
			this.addDesktop();
			this.slideTo(this.desktops.length - 1);
		},
		removeCurrentDesktop:function(){
			log('removeCurrentDesktop',this);
			var self = this,
				list = self.list,
				desktops = self.desktops,
				current = self.current,
				item,
				prev = current - 1;
			
			if(desktops.length>1){
				// do dirty things
				item = list.all('.desktop').item(current);
				
				// remove all pannels of current desktops
				current.pannels.forEach(function(pannel){
					current.remove(pannel);
				});
				
				// remove desktop from desktop list
				self.desktops = desktops = kickoff(desktops,current);
				list.removeChild(item);
				self.current = ( current == desktops.length) ? desktops.length-1 : current;
				
				
				self.render();
			}
		},
		getCurrentDesktop:function(){
			log('getCurrentDesktop',this);
			return this.desktops[this.current];
		},
		
		// 实际存数据的方法只留这一个
		sync:function(){
			log('sync',this);
			var desktops = this.desktops.map(function(d){
				return d.pannels.map(function(pan){
					return pan.config;
				});
			});
			var data = {
				desktops:desktops,
				current:this.current
			};
			
			data = JSON.stringify(data);
			
			localStorage.setItem("desktops",data);
			YUI().use('io',function(Y){
				Y.on('io:success', function(){
				});
   				Y.io(APP_CONFIG['deskUrl'],{
					method: 'POST',
					data: 'data='+data
   				});
			});
			
		}
	}
	
	Y.DesktopManager = DesktopManager;


});
