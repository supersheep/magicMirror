// TODO:
// 1. when slideback, do nothing, yes, not destroy it.
// 2. when slideup, if not the last, push view from cache. or if last , the "push" button become a "add" button
// 3. when mouseover the top, use can close the current desktop. yes , destroy it

/*
 data structs
desktops [
	[pannel1,pannel2,pannel3],
]
*/

YUI.add('desktop',function(Y){
		
	
	var Dom = Y.Node;
	var winWidth,winHeight;
	
	
	function kickoff(arr,index){
		var i = +index;
			before = arr.slice(0,i),
			after = arr.slice(i+1,arr.length);
		
		return before.concat(after);
	}
	
	
	
	var Desktop = function(idx){
		this.elem = Dom.create('<div/>').addClass('desktop');
		this.index = idx;
		this.pannels = [];
	}
	
	Desktop.prototype = {
		constructor:Desktop,
		add:function(modulePannel){
			this.pannels.push(modulePannel);
			this.sync();
		},
		remove:function(pannel){
			var self = this,
				arr = self.pannels,
				l = arr.length;
			for(var i = 0 ; i <= arr.length ; i++){
				if(arr[i].guid == pannel.guid){
					break;
				}
			}
			pannel.elem.setStyles({
				'opacity':0
			});
			pannel.elem.one('.card').setStyles({
				'width':0,
				'height':0,
				'overflow':'hidden'
			});
			
			// remove the pannel
				clearInterval(pannel.clock);
				self.elem.removeChild(pannel.elem);
				pannel = null;
			
			
			self.pannels = kickoff(arr,i);
			
			self.sync();
		},
		resize:function(){
			var elem = this.elem;
			elem.setStyle('width',elem.get('winWidth'));
		},
		destroy:function(){
			this.pannels = [];
			this.elem.remove();
			this.sync();
		},
		sync:function(){
			this.fire("sync");
		}
	}
	
	
	Y.augment(Desktop, Y.EventTarget);
	
	var DesktopManager = function(container,initdata){
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
		
		Y.on('windowresize',Y.bind(self.render,self));
		leftbtn.on('click',Y.bind(self.left,self));
		rightbtn.on('click',Y.bind(self.right,self));	
		addbtn.on('click',Y.bind(self.addto,self));
		removebtn.on('click',Y.bind(self.remove,self));
		spots.on('click',function(e){
			self.to(e.target.getAttribute('data-index'));
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
			self.to(0);
		}else{
			self.current = initdata.current;
			initdata.desktops.forEach(function(d){
				var desk = self.add();
				d.forEach(function(cfg){
					Y.Monitor.produce(cfg.type,cfg.xy,desk,{
						setting:cfg.setting,
						size:cfg.size,
						xy:cfg.xy
					});
				});
			});
			
			self.to(initdata.current);
		}
	}
		
	DesktopManager.prototype = {
		constructor:DesktopManager,
		render:function(){
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
			var self = this;
			"addbtn removebtn leftbtn rightbtn".split(' ').forEach(function(e){			
				self[e].setStyle('opacity',0);
			});
		},
		showControls:function(){
			
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
		
			if(this.current < this.desktops.length-1){
				this.to(this.current+1);
			}
		},
		left:function(){		
		
			if(this.current > 0){
				this.to(this.current-1);
			}
		},
		to:function(n){
			if(n>=0 && n<=this.desktops.length -1){
				this.current = +n;
				this.render();
			}
			this.sync();
		},
		add:function(){
			var self = this,
				max = self.max,
				desktops = self.desktops,
				list = self.list,
				spots = self.spots,
				desktop;

			if(desktops.length < max){
				desktop = new Desktop(desktops.length);
				desktop.desktops = this;
				desktop.on("sync",Y.bind(self.sync,self));
				desktops.push(desktop);
				list.append(desktop.elem);
				//self.current = desktops.length - 1;
				//self.render();
				self.sync();
				return desktop;
			}
		},
		addto:function(){
			this.add();
			this.to(this.desktops.length - 1);
		},
		remove:function(){
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
			
			this.sync();
		},
		getCurrent:function(){
			return this.desktops[this.current];
		},
		
		// 实际存数据的方法只留这一个
		sync:function(){
			var desktops = this.desktops.map(function(d){
				return d.pannels.map(function(pan){
					return pan.config;
				});
			});
			var data = {
				desktops:desktops,
				current:this.current
			};
			
			localStorage.setItem("desktops",JSON.stringify(data));
		}
	}
	
	Y.Desktop = DesktopManager;

});