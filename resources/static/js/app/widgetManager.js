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
				desktop = desktops.getCurrentDesktop(),
				node = this.get('node');
				
				
			// add a monitor to a desktop
			Y.MonitorFactory.produce(o.title,xy,desktop,{
				setting:o.setting
			});
			
			desktop.sync();
			
		});
	}


	
	function WidgetManager(all_widgets,my_widgets,desktops){
		log('init',this);
		var self = this,
			wrap = div('widgets'),
			pannel = div('pannel'),
			editpannel = self.createEditPannel(),
			ul = dom('ul','list'),
			checkboxes = [],
			elem = this.elem = div('widget-manager'),
			close = this.close  = div('close'),
			title = div('title').set('innerHTML','管理Widget…'),
			createbtn = div('create').set('innerHTML','new');
		// my_widgets = my_widgets || [{name:"line"}];
		close.on('click',Y.bind(this.hide,this));
		
		elem.append(close);
		elem.append(wrap);
			wrap.append(title);
				title.append(createbtn);
			wrap.append(ul);
		elem.append(editpannel);
		elem.appendTo('body');
		
		self.wrap = wrap;
		self.editpannel = editpannel;
		self.my_widgets = my_widgets;
		self.tools = Y.Node.one('.tools');
		self.desktops = desktops;		
		self.checkboxes = checkboxes;
		self.current_widgets = [];
		
		
		all_widgets.forEach(function(widget,i){
			var li = dom('li','clear ' + (i%2?'order':'even')),
				checkbox = dom('input','checkbox').set('type','checkbox'),
				img = dom('img','icon').set('src',widget.icon),
				title = dom('span','title').set('innerHTML',widget.title);
			
			checkbox.on('click',function(e){
				var checked = e.target.get('checked');
				self[checked?'addWidget':'removeWidget'](widget,i);
				self.sync();
			});
			checkboxes.push(checkbox);
			li.append(checkbox);
			li.append(img);
			li.append(title);
			ul.append(li);
		});
		
		
		my_widgets.forEach(function(widget,i){
			for(var i = 0, l = all_widgets.length ; i < l ; i++ ){
				if(all_widgets[i].title == widget.title){
					self.addWidget(widget,i);
					break;
				}
			}
		});
		
		createbtn.on('click',function(){
			self.createWidget();
		});
		
		
		new Y.DD.Drag({
			node: elem
		}).addHandle(title);	
		self.hide();
		
	}
		
	WidgetManager.prototype = {
		constructor : WidgetManager,
		addWidget:function(e,i){
			log('addWidget',this);
			var self = this,
				checkbox = self.checkboxes[i],
				witem = dom('li','item'),
				img = dom('img'),
				p = dom('p','title');
			
			
			// already exist
			if(self.current_widgets.some(function(widget,i){
				return e.title == widget.title;
			})){
				return false;
			};
			
			
			img.set('src',e.icon);
			img.set('alt',e.title);
				
			p.set('innerHTML',e.title);
			
			witem.setAttribute('data-title',e.title);
			witem.append(img);
			witem.append(p);
			
			initDrag(witem,e,self.desktops);
			
			checkbox.set('checked','checked');
			
			self.tools.append(witem);
			self.current_widgets.push(e);
			
		},
		removeWidget:function(e,i){
			log('removeWidget',this);
			var self = this,
				checkbox = self.checkboxes[i],
				current_widgets = self.current_widgets;
			
			// remove from dom
			Y.Node.all('.tools .item').each(function(el,i){
				if(el.getAttribute('data-title') == e.title){
					el.remove(true);
				}
			});
			
			// remove from data
			current_widgets.forEach(function(widget,i){
				if(widget.title == e.title){
					current_widgets.splice(i,1);
				}
			});
		},
		createEditPannel:function(){
			var editpannel = div('editpannel'),
				icon = div('icon'),
				iconhint = div('iconhint'),
				settings = div('settings');
			
			editpannel.append(icon);
				icon.append(iconhint);
			editpannel.append(settings);
			
			this.settings = settings;
			
			return editpannel;
			
		},
		createWidget:function(obj){
			var self = this,
				data = Y.merge({title:"",xkey:"",ykeys:"",names:"",alias:""},obj),
				setting_pannel = new Y.Setting(data),
				imgnode = dom('img'),
				editpannel = self.editpannel;
				
			if(obj && obj.img){
				imgnode.setAttribute('src',obj.img);
				editpannel.one('.icon').append(imgnode);
			}
			setting_pannel.renderUI(self.settings);
			setting_pannel.on('complete',function(data){
				editpannel.setStyle('left',10);
				console.log(data);
			});
			editpannel.setStyle('height',self.wrap.get('clientHeight'));
			editpannel.setStyle('left',240);
		},
		sync:function(){
			log('sync',this);
			var data = JSON.stringify(this.current_widgets);
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
			this.elem.setStyle('display','block');	
		}
	}
	
	
	Y.WidgetManager = WidgetManager;
});