YUI.add('widgetManager',function(Y){
	
	function dom(tag,cls){
	
		var node = Y.Node.create('<'+tag+' />');
		cls && node.addClass(cls);
		return node;
		
	}
	
	function div(cls){
	
		return dom('div',cls);
		
	}
	
	
	function initDrag(li,o){
		// 初始化拖放
		var title = o.config.title;
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
		
		// 拖拽结束
		drag.on('drag:drophit', function(e) {
			var xy = e.target.mouseXY,
				desktop = desktopManager.getCurrentDesktop(),
				node = this.get('node');
				
				console.log(o);
			// add a monitor to a desktop
			monitorFactory.produce(title,xy,desktop,{
				config:o.config
			});
			
			desktop.sync();
			
		});
	}


	// 初始化widgetPannel
	function WidgetManager(all_widgets,my_widgets){
		log('init',this);
		var self = this,
			checkboxes = [],
			editpannel = self.initEditPannel(),
			ul = dom('ul','list'),
			wrap = div('widgets'),
			pannel = div('pannel'),
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
		
		self.ul = ul;
		self.wrap = wrap;
		self.editpannel = editpannel;
		self.all_widgets = all_widgets;
		self.my_widgets = my_widgets;
		self.tools = Y.Node.one('.tools');
		self.checkboxes = checkboxes;
		self.current_widgets = [];
		
		
		all_widgets.forEach(function(widget,i){
			self.addToWidgetBank(widget,i);
		});
		
		
		my_widgets.forEach(function(widget,i){
			for(var i = 0, l = all_widgets.length ; i < l ; i++ ){
				if(all_widgets[i].config.title == widget.config.title){
					self.addWidget(widget,i);
					break;
				}
			}
		});
		
		createbtn.on('click',function(){
			self.modifyWidget();
		});
		
		
		new Y.DD.Drag({
			node: elem
		}).addHandle(title);	
		self.hide();
		
	}
		
	WidgetManager.prototype = {
		constructor : WidgetManager,
		addToWidgetBank:function(widget,i){
			var self = this,
				li = dom('li','clear ' + (i%2?'order':'even')),
				checkbox = dom('input','checkbox').set('type','checkbox'),
				edit = dom('span','edit').set('innerHTML','编辑'),
				img = dom('img','icon').set('src',widget.icon),
				title = dom('span','title').set('innerHTML',widget.config.title);
			
			
			
			checkbox.on('click',function(e){
				var checked = e.target.get('checked');
				self[checked?'addWidget':'removeWidget'](widget,i);
				self.sync();
			});
			
			
			
			edit.on('click',function(){
				self.modifyWidget(widget);
			});
			
			self.checkboxes.push(checkbox);
			li.append(checkbox);
			li.append(img);
			li.append(title);
			li.append(edit);
			self.ul.append(li);
			
			if(!self.all_widgets.some(function(w){
				return w.config.title == widget.config.title;
			})){
				self.all_widgets.push(widget);
			}
			
			
			console.log("from widget manager");
			self.fire('addone',widget);
		},
		getConfig:function(name){
			var all = this.all_widgets;
			for(var i=0;widget = all[i];i++){
				if(widget.config.title == name){
					return widget.config;
				}
			}
			return null;
		},
		addWidget:function(o,i){
			log('addWidget',this);
			var self = this,
				checkbox = self.checkboxes[i],
				title = o.config.title,
				icon = o.icon,
				witem = dom('li','item'),
				img = dom('img'),
				p = dom('p','title');
			
			
			// already exist
			if(self.current_widgets.some(function(widget,i){
				return title == widget.config.title;
			})){
				return false;
			};
			
			// else add it
			
			img.set('src',icon);
			img.set('alt',title);
			p.set('innerHTML',title);
			
			// ready for remove
			witem.setAttribute('data-title',title);
			witem.append(img);
			witem.append(p);
			
			// 底部控件
			initDrag(witem,o);
			
			checkbox.set('checked','checked');
			
			self.tools.append(witem);
			self.current_widgets.push(o);
			
		},
		removeWidget:function(e,i){
			log('removeWidget',this);
			var self = this,
				title = e.config.title,
				checkbox = self.checkboxes[i],
				current_widgets = self.current_widgets;
			
			// remove from dom
			Y.Node.all('.tools .item').each(function(el,i){
				if(el.getAttribute('data-title') == title){
					el.remove(true);
				}
			});
			
			// remove from data
			current_widgets.forEach(function(widget,i){
				if(title == widget.config.title){
					current_widgets.splice(i,1);
				}
			});
		},
		initEditPannel:function(){
			var self = this,
				editpannel = div('editpannel'),
				icon = div('icon'),
				imgholder = div('imgholder'),
				iconhint = div('iconhint'),
				settings = div('settings');
			
			editpannel.append(icon);
				icon.append(iconhint);
				icon.append(imgholder);
			editpannel.append(settings);
			
			this.settings = settings;
			
			var di = new Y.DropImage(imgholder);
			
			di.on('load',function(obj){
				iconhint.setStyle('visibility','hidden');
				self.imagedata = obj.filedata;
			});
			
			return editpannel;
		},
		
		// {}
		modifyWidget:function(obj){
			var self = this,
				formdata = self.formdata = new FormData(),
				data,
				setting_pannel, // 设置字段
				imgnode = dom('img'),
				editpannel = self.editpannel,
				iconhint = editpannel.one('.iconhint'),
				imgholder = editpannel.one('.imgholder');
			
			//edit
			if(obj){
				data = obj.config;
				if(obj.icon){
					iconhint.setStyle('visibility','hidden');
					imgholder.empty();
					imgholder.append(imgnode);
					imgnode.setAttribute('src',obj.icon);
				}
			//create
			}else{
				self.imagedata = null;
				iconhint.setStyle('visibility','visible');
				imgholder.empty();
				data = {title:"",names:"",xkey:"",ykeys:""};
				iconhint.set('innerHTML','拖拽图片至此');
			}
			
			setting_pannel = new Y.Setting(data);
			setting_pannel.renderUI(self.settings);
			
			
			setting_pannel.on('complete',function(data){
				var imgnode = imgholder.one('img');
				var xhr = new XMLHttpRequest();
				var imagedata = self.imagedata || null;
				
				editpannel.setStyle('left',10);
				
				if(imagedata){
					formdata.append("imgsrc",imagedata);	
				}
				
				if(obj && obj.icon){
					formdata.append("icon",obj.icon);
				}
				
				for(var i in data){
					formdata.append(i,data[i]);
				}
				xhr.onload = function(){
					var json = JSON.parse(this.responseText);
					self.addToWidgetBank(json,self.all_widgets.length);
				}
				xhr.open("post", APP_CONFIG['defineUrl'], true);
				xhr.send(formdata);
			});
			
			
			editpannel.setStyle('height',self.wrap.get('clientHeight'));
			editpannel.setStyle('left',240);
		},
		
		// 同步数据
		sync:function(){
			log('sync',this);
			var data = JSON.stringify(this.current_widgets);
			localStorage.setItem('widgets',data);
			YUI().use('io',function(Y){
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
	
	
	Y.augment(WidgetManager, Y.EventTarget);
	
	Y.WidgetManager = WidgetManager;
});