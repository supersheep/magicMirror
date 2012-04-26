YUI.add('widgetManager',function(Y){

	function dom(tag,cls){
	
		var node = Y.Node.create('<'+tag+' />');
		cls && node.addClass(cls);
		return node;
		
	}
	
	function div(cls){
	
		return dom('div',cls);
		
	}
	
	
	function initDrag(li,o,desktops){
		var drag= new Y.DD.Drag({
			node: li
		}).plug(Y.Plugin.DDProxy,{
			moveOnEnd: false
		});
		
		drag.on('drag:start',function(){
			var p = this.get('dragNode'),
				n = this.get('node');

			p.setStyle('opacity', .25);
			if (!this._playerStart) {
				this._playerStart = this.nodeXY;
			}
			p.set('innerHTML', n.get('innerHTML'));
			p.setStyles({
				backgroundColor: n.getStyle('backgroundColor'),
				color: n.getStyle('color'),
				border:'none',
				opacity: .65
			});
			p.addClass('item');						
		});
		
		drag.on('drag:end', function(e) {
			var n = this.get('node');
			n.setStyle('opacity', '1');
		});
		
		drag.on('drag:drophit', function(e) {
			var xy = e.target.mouseXY,
				node = this.get('node');
				
				
			// add a monitor to a desktop
			Y.MonitorFactory.produce(o.title,xy,desktops.getCurrentDesktop(),{
				setting:o.setting
			});
			
		});
	}


	
	function WidgetManager(widgets,my_widgets,desktops){
			log('init',this);
		var self = this,
			wrap = div('widgets'),
			ul = dom('ul','list'),
			elem = this.elem = div('widget-manager'),
			close = this.close  = div('close');
		
		// my_widgets = my_widgets || [{name:"line"}];
		close.on('click',Y.bind(this.hide,this));
		
		elem.append(close);
		elem.append(wrap);
		wrap.append(ul);
		
		self.my_widgets = my_widgets;
		self.tools = Y.Node.one('.tools');
		self.desktops = desktops;
		widgets.forEach(function(e,i){
			var li = dom('li','clear ' + (i%2?'order':'even')),
				checkbox = dom('input','checkbox').set('type','checkbox'),
				img = dom('img','icon').set('src',e.icon),
				checked = false,
				title = dom('span','title').set('innerHTML',e.title);
			
			if(my_widgets.some(function(m){
				return m.title == e.title;
			})){
				checked = true;
				self.addWidget(e,li,checkbox);
			}
			
			checkbox.on('click',function(){
				checked = !checked;
				if(checked){
					self.addWidget(e,li,checkbox);
				}else{
					self.removeWidget(e,li,checkbox);
				}
				self.sync();
			});
				
			li.append(checkbox);
			li.append(img);
			li.append(title);
			ul.append(li);
		});
		
		new Y.DD.Drag({
			node: elem
		});		
		elem.appendTo('body');
		self.hide();
		
	}
		
	WidgetManager.prototype = {
		constructor : WidgetManager,
		addWidget:function(e,li,checkbox){
			log('addWidget',this);
			var self = this,
				witem = dom(li,'item'),
				img = dom('img'),
				p = dom('p','title');
			
			li.addClass('active');
				
			img.set('src',e.icon);
			img.set('alt',e.title);
				
			p.set('innerHTML',e.title);
			
			witem.setAttribute('data-title',e.title);
			witem.append(img);
			witem.append(p);
			
			initDrag(witem,e,self.desktops);
			
			checkbox.set('checked','checked');
			
			self.tools.append(witem);
			self.my_widgets.push(e);
		},
		removeWidget:function(e,li,checkbox){
			log('removeWidget',this);
			var self = this,
				my_widgets = self.my_widgets;
			
			
			li.removeClass('active');
			
			Y.Node.all('.tools .item').each(function(el,i){
				if(el.getAttribute('data-title') == e.title){
					el.remove(true);
				}
			});
			
			my_widgets.forEach(function(el,i){
				if(e.title == el.title){
					my_widgets = my_widgets.slice(0,i).concat(my_widgets.slice(i+1,length));	
					self.my_widgets = my_widgets;
				}
			});
			
		},
		sync:function(){
			log('sync',this);
			var data = JSON.stringify(this.my_widgets);
			localStorage.setItem('widgets',data);
			YUI().use('io',function(Y){
				Y.on('io:success', function(){
				});
   				Y.io(APP_CONFIG['widgetUrl'],{
					method: 'POST',
					data: 'data='+data
   				});
			});
		},
		show : function(){
			log('show',this);
			this.elem.setStyle('display','block');
		},
		hide:function(){
			log('hide',this);
			this.elem.setStyle('display','none');	
		}
	}
	
	
	Y.WidgetManager = WidgetManager;
});